package com.a407.sniffythedog.application.night;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.gamelog.out.GameLogRedisPort;
import com.a407.sniffythedog.application.night.in.*;
import com.a407.sniffythedog.application.night.out.NightEventPort;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.application.vote.out.RoomEventPort;
import com.a407.sniffythedog.domain.game.entity.*;
import com.a407.sniffythedog.domain.game.enums.GameRole;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class NightActionService implements
        MafiaNightUseCase, DoctorNightUseCase, PoliceNightUseCase, NightResolveUseCase {

    private final RedisRoomPort redisRoomPort;
    private final NightEventPort eventPort;
    private final RoomEventPort roomEventPort;
    private final GameLogRedisPort gameLogRedisPort;

    private final NightResolver resolver = new NightResolver();

    public NightActionService(RedisRoomPort redisRoomPort, NightEventPort eventPort, RoomEventPort roomEventPort, GameLogRedisPort gameLogRedisPort) {
        this.redisRoomPort = redisRoomPort;
        this.eventPort = eventPort;
        this.roomEventPort = roomEventPort;
        this.gameLogRedisPort = gameLogRedisPort;
    }

    private int currentRound(RoomSession room) {
        return room.getGameState().round();
    }

    // --- 마피아 확정 ---
    @Override
    public void execute(MafiaActionCommand command) {
        String roomCode = command.roomCode();
        Long mafiaUserId = command.userId();
        Long targetUserId = command.targetUserId();
        // requestId는 필요 시 로그나 ACK에 사용 (현재는 이벤트 발행 시 사용)

        RoomId roomId = RoomId.of(roomCode);
        final NightLogHolder holder = new NightLogHolder();

        RoomSession updated = redisRoomPort.updateRoomAtomically(roomId, room -> {
            requireNight(room);

            GameUserId mafiaId = GameUserId.of(mafiaUserId);
            GameUserId targetId = GameUserId.of(targetUserId);

            PlayerState mafia = requireAlive(room, mafiaId);
            if (!mafia.isMafia()) throw ApplicationException.of(ExceptionType.BAD_REQUEST);

            requireAlive(room, targetId);

            // 2. [선착순 체크] 이미 타겟이 설정되어 있는지 확인
            GameUserId currentTarget = room.getGameState().night().mafiaTargetUserId();
            
            if (currentTarget != null) {
                // 먼저 눌렸다면 후속 요청은 모두 거절
                throw ApplicationException.of(ExceptionType.ALREADY_VOTED, "이미 타겟이 확정되었습니다.");
            }

            room.setMafiaTarget(targetId);

            holder.shouldLog = true;
            holder.round = currentRound(room);
            holder.targetUserId = targetUserId;
            return room;
        });

        // 결과 브로드캐스트 (마피아 채널)
        eventPort.mafiaTargetLocked(roomCode, command.requestId(), updated.getVersion(), GameUserId.of(targetUserId));

        if (holder.shouldLog) {
            gameLogRedisPort.saveEvent(roomCode, GameEvent.mafiaTarget(holder.round, holder.targetUserId));
        }
    }

    // --- 의사 선택 ---
    @Override
    public void execute(DoctorActionCommand command) {
        String roomCode = command.roomCode();
        Long doctorUserId = command.userId();
        Long targetUserId = command.targetUserId();

        RoomId roomId = RoomId.of(roomCode);
        final NightLogHolder holder = new NightLogHolder();

        redisRoomPort.updateRoomAtomically(roomId, room -> {
            requireNight(room);

            GameUserId doctorId = GameUserId.of(doctorUserId);
            GameUserId targetId = GameUserId.of(targetUserId);

            PlayerState doctor = requireAlive(room, doctorId);
            if (!doctor.isDoctor()) throw ApplicationException.of(ExceptionType.BAD_REQUEST);
            requireAlive(room, targetId);

            room.setDoctorTarget(targetId);

            holder.shouldLog = true;
            holder.round = currentRound(room);
            holder.actorUserId = doctorUserId;
            holder.targetUserId = targetUserId;
            return room;
        });

        if (holder.shouldLog) {
            gameLogRedisPort.saveEvent(roomCode, GameEvent.doctorSave(holder.round, holder.actorUserId, holder.targetUserId));
        }
    }

    // --- 경찰 선택 ---
    @Override
    public void execute(PoliceActionCommand command) {
        String roomCode = command.roomCode();
        Long policeUserId = command.userId();
        Long targetUserId = command.targetUserId();

        RoomId roomId = RoomId.of(roomCode);
        final NightLogHolder holder = new NightLogHolder();

        RoomSession updated = redisRoomPort.updateRoomAtomically(roomId, room -> {
            requireNight(room);

            GameUserId policeId = GameUserId.of(policeUserId);
            GameUserId targetId = GameUserId.of(targetUserId);

            PlayerState police = requireAlive(room, policeId);
            if (!police.isPolice()) throw ApplicationException.of(ExceptionType.BAD_REQUEST);

            requireAlive(room, targetId);
            room.setPoliceTarget(targetId);

            holder.shouldLog = true;
            holder.round = currentRound(room);
            holder.actorUserId = policeUserId;
            holder.targetUserId = targetUserId;
            return room;
        });

        PlayerState target = updated.getPlayer(GameUserId.of(targetUserId));
        boolean isMafia = target != null && target.getGameRole() == GameRole.MAFIA;

        // 결과 전송 (경찰 개인)
        eventPort.policeResult(roomCode, command.requestId(), GameUserId.of(policeUserId), GameUserId.of(targetUserId), isMafia);

        if (holder.shouldLog) {
            gameLogRedisPort.saveEvent(roomCode, GameEvent.policeCheck(holder.round, holder.actorUserId, holder.targetUserId, isMafia));
        }
    }

    // --- 밤 정산 ---
    @Override
    public void execute(NightResolveCommand command) {
        String roomCode = command.roomCode();
        // 정산은 보통 시스템이나 방장이 호출하므로 userId 체크는 선택사항

        RoomId roomId = RoomId.of(roomCode);
        final ResolveHolder holder = new ResolveHolder();

        RoomSession updated = redisRoomPort.updateRoomAtomically(roomId, room -> {
            requireNight(room);

            GameUserId mafiaTarget = room.getGameState().night().mafiaTargetUserId();
            GameUserId doctorTarget = room.getGameState().night().doctorTargetUserId();

            holder.round = currentRound(room);
            holder.mafiaTargetUserId = mafiaTarget == null ? null : mafiaTarget.value();
            holder.doctorTargetUserId = doctorTarget == null ? null : doctorTarget.value();

            RoomNightState temp = new RoomNightState();
            if (mafiaTarget != null) temp.lockMafiaTarget(mafiaTarget);
            if (doctorTarget != null) temp.setDoctorTarget(doctorTarget);

            NightResolutionResult result = resolver.resolve(temp);
            holder.saved = result.saved();

            if (result.killedUserId() != null) {
                holder.killedUserId = result.killedUserId();
                holder.killedUserIdValue = result.killedUserId().value();
                holder.killed = true;
                room.killPlayer(result.killedUserId());
            }

            room.checkAndEndIfGameOver().ifPresent(winner -> {
                holder.finished = true;
                holder.winnerTeam = winner.name();
            });

            if (!holder.finished) {
                Instant endsAt = Instant.now().plus(120, ChronoUnit.SECONDS);
                room.transitionToPhase(Phase.DAY, endsAt);
                holder.phaseChanged = true;
                holder.phase = Phase.DAY;
                holder.phaseEndsAt = endsAt;
            }
            return room;
        });

        long version = updated.getVersion();

        // 1. 밤 결과 알림 (종합)
        eventPort.nightResolved(roomCode, command.requestId(), version, holder.killedUserId, holder.saved);

        // 2. 사망자 상태 변경
        if (holder.killed) {
            eventPort.playerStatusChanged(roomCode, null, version, holder.killedUserId, false, "NIGHT_KILLED");
        }

        // 3. 페이즈 변경
        if (holder.phaseChanged) {
            eventPort.phaseChanged(roomCode, null, version, holder.phase, holder.phaseEndsAt);
        }

        // 4. 게임 종료
        if (holder.finished) {
            roomEventPort.publishGameFinished(roomCode, version, holder.winnerTeam, null);
        }

        // 로그 저장 (기존과 동일)
        saveLogs(roomCode, holder);
    }

    private void saveLogs(String roomCode, ResolveHolder holder) {
        gameLogRedisPort.saveEvent(roomCode, GameEvent.nightResolve(holder.round, holder.mafiaTargetUserId, holder.doctorTargetUserId, holder.killedUserIdValue, holder.saved));
        if (holder.killed) gameLogRedisPort.saveEvent(roomCode, GameEvent.kill(holder.round, holder.killedUserIdValue));
        if (holder.phaseChanged) gameLogRedisPort.saveEvent(roomCode, GameEvent.phaseChanged(holder.round, holder.phase));
        if (holder.finished) gameLogRedisPort.saveEvent(roomCode, GameEvent.gameFinished(holder.round, holder.winnerTeam));
    }

    // Helper Methods & Classes (유지)
    private void requireNight(RoomSession room) {
        if (room.getGameState().phase() != Phase.NIGHT) throw ApplicationException.of(ExceptionType.INVALID_PHASE);
    }
    private PlayerState requireAlive(RoomSession room, GameUserId userId) {
        PlayerState p = room.getPlayer(userId);
        if (p == null) throw ApplicationException.of(ExceptionType.BAD_REQUEST);
        if (!p.isAlive()) throw ApplicationException.of(ExceptionType.PLAYER_DEAD);
        return p;
    }

    private static class ResolveHolder {
        int round;
        Long mafiaTargetUserId; Long doctorTargetUserId;
        Long killedUserIdValue; GameUserId killedUserId;
        boolean saved; boolean killed; boolean finished;
        String winnerTeam; boolean phaseChanged;
        Phase phase; Instant phaseEndsAt;
    }
    private static class NightLogHolder {
        boolean shouldLog; int round; Long actorUserId; Long targetUserId;
    }
}