package com.a407.sniffythedog.application.night;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.night.in.*;
import com.a407.sniffythedog.application.night.out.NightEventPort;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.application.vote.out.RoomEventPort;
import com.a407.sniffythedog.domain.game.entity.*;
import com.a407.sniffythedog.domain.game.enums.GameRole;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class NightActionService implements
        MafiaNightUseCase, DoctorNightUseCase, PoliceNightUseCase, NightResolveUseCase {

    private final RedisRoomPort redisRoomPort; // 원자적으로 수정할 떄 사용
    private final NightEventPort eventPort; // WS 메세지 발행 전용 포트
    private final RoomEventPort roomEventPort;

    private final NightResolver resolver = new NightResolver(); // 밤 정산 하는 것

    public NightActionService(RedisRoomPort redisRoomPort, NightEventPort eventPort, RoomEventPort roomEventPort) {
        this.redisRoomPort = redisRoomPort;
        this.eventPort = eventPort;
        this.roomEventPort = roomEventPort;
    }

    // 마피아 확정
    @Override
    public void selectMafia(String roomCode, long mafiaUserId, long targetUserId) {
        RoomId roomId = RoomId.of(roomCode);

        RoomSession updated = redisRoomPort.updateRoomAtomically(roomId, room -> {
            requireNight(room); // 방이 NIGHT 가 아니면 예외

            GameUserId mafiaId = GameUserId.of(mafiaUserId);
            GameUserId targetId = GameUserId.of(targetUserId);

            PlayerState mafia = requireAlive(room, mafiaId); // 방 참가 + 생존 검증
            if (!mafia.isMafia()) throw ApplicationException.of(ExceptionType.BAD_REQUEST); // 마피아 인지  확인하기

            requireAlive(room, targetId); // 타겟도 검증
            room.setMafiaTarget(targetId); // touch()로 version 증가
            return room;
        });

        // 업데이트 끝난 뒤 결과 값 넣기
        eventPort.mafiaTargetLocked(roomCode, updated.getVersion(), GameUserId.of(targetUserId));
    }

    // 의사 선택
    @Override
    public void selectDoctor(String roomCode, long doctorUserId, long targetUserId) {
        RoomId roomId = RoomId.of(roomCode);

        redisRoomPort.updateRoomAtomically(roomId, room -> {
            requireNight(room);

            GameUserId doctorId = GameUserId.of(doctorUserId);
            GameUserId targetId = GameUserId.of(targetUserId);

            PlayerState doctor = requireAlive(room, doctorId);
            if (!doctor.isDoctor()) throw ApplicationException.of(ExceptionType.BAD_REQUEST);
            requireAlive(room, targetId);

            room.setDoctorTarget(targetId);
            return room;
        });

        // 의사는 공개 이벤트 없음
    }

    //  경찰 선택 + 개인 결과
    @Override
    public void selectPolice(String roomCode, long policeUserId, long targetUserId) {
        RoomId roomId = RoomId.of(roomCode);

        RoomSession updated = redisRoomPort.updateRoomAtomically(roomId, room -> {
            requireNight(room);

            GameUserId policeId = GameUserId.of(policeUserId);
            GameUserId targetId = GameUserId.of(targetUserId);

            PlayerState police = requireAlive(room, policeId);
            if (!police.isPolice()) throw ApplicationException.of(ExceptionType.BAD_REQUEST);

            PlayerState target = requireAlive(room, targetId);

            room.setPoliceTarget(targetId);
            return room;
        });

        // 업데이트 후 최신 room 다시 읽어서 판정하는 로직
        PlayerState target = updated.getPlayer(GameUserId.of(targetUserId));
        boolean isMafia = target != null && target.getGameRole() == GameRole.MAFIA;

        eventPort.policeResult(
                roomCode,
                GameUserId.of(policeUserId),
                GameUserId.of(targetUserId),
                isMafia
        );
    }

    // 밤 정산
    @Override
    public void resolve(String roomCode) {
        RoomId roomId = RoomId.of(roomCode);

        final ResolveHolder holder = new ResolveHolder();

        RoomSession updated = redisRoomPort.updateRoomAtomically(roomId, room -> {
            requireNight(room);

            // NightState getter는 실제 코드에 맞춰 수정 필요)
            GameUserId mafiaTarget = room.getGameState().night().mafiaTargetUserId();
            GameUserId doctorTarget = room.getGameState().night().doctorTargetUserId();

            RoomNightState temp = new RoomNightState();
            if (mafiaTarget != null) temp.lockMafiaTarget(mafiaTarget);
            if (doctorTarget != null) temp.setDoctorTarget(doctorTarget);

            // 죽어야하는 사람 , 의사가 막았는지 들어있음
            NightResolutionResult result = resolver.resolve(temp);
            holder.saved = result.saved();

            // 결과 반영
            if (result.killedUserId() != null) {
                holder.killedUserId = result.killedUserId();
                holder.killed = true;
                room.killPlayer(result.killedUserId());
            }

            // 승리 체크 + 종료 반영
            room.checkAndEndIfGameOver().ifPresent(winner->{
                holder.finished = true;
                holder.winnerTeam = winner.name();
            });

            if (!holder.finished) {
                Instant endsAt = Instant.now().plus(120, ChronoUnit.SECONDS);
                // 일단 DAY PHASE 120으로 설정해놨는데 (2분 ..)
                // 나중에 하드 코딩 말고 바꾸기
                //TODO: 하드 코딩 말고 시간 초 바꾸기
                room.transitionToPhase(Phase.DAY, endsAt);
                holder.phaseChanged = true;
                holder.phase = Phase.DAY;
                holder.phaseEndsAt = endsAt;
            }

            return room;
        });

        eventPort.nightResolved(roomCode, updated.getVersion(), holder.killedUserId, holder.saved);

        // 2) 사망자 있으면 상태 변경 알림
        if (holder.killed) {
            eventPort.playerStatusChanged(
                    roomCode,
                    updated.getVersion(),
                    holder.killedUserId,
                    false,
                    "NIGHT_KILLED"
            );
        }

        // 3) 페이즈 변경 (게임이 끝났으면 굳이 DAY로 안 넘김)
        if (holder.phaseChanged) {
            eventPort.phaseChanged(
                    roomCode,
                    updated.getVersion(),
                    holder.phase,
                    holder.phaseEndsAt
            );
        }

        // 4) 게임 종료 브로드캐스트
        if (holder.finished) {
            roomEventPort.publishGameFinished(roomCode, updated.getVersion(), holder.winnerTeam, null);
        }
    }

    private void requireNight(RoomSession room) {
        if (room.getGameState().phase() != Phase.NIGHT) {
            throw ApplicationException.of(ExceptionType.INVALID_PHASE);
        }
    }

    private PlayerState requireAlive(RoomSession room, GameUserId userId) {
        PlayerState p = room.getPlayer(userId);
        if (p == null) throw ApplicationException.of(ExceptionType.BAD_REQUEST);
        if (!p.isAlive()) throw ApplicationException.of(ExceptionType.PLAYER_DEAD);
        return p;
    }

    private static class ResolveHolder {
        GameUserId killedUserId;
        boolean saved;

        boolean killed;

        boolean finished;
        String winnerTeam;

        boolean phaseChanged;
        Phase phase;
        Instant phaseEndsAt;
    }
}
