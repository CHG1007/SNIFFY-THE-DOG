package com.a407.sniffythedog.application.night;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.night.in.*;
import com.a407.sniffythedog.application.night.out.NightEventPort;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
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

    private final NightResolver resolver = new NightResolver(); // 밤 정산 하는 것

    public NightActionService(RedisRoomPort redisRoomPort, NightEventPort eventPort) {
        this.redisRoomPort = redisRoomPort;
        this.eventPort = eventPort;
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

            // 결과 반영
            if (result.killedUserId() != null) {
                room.killPlayer(result.killedUserId());
            }

            // 다음 페이즈로
            Instant endsAt = Instant.now().plus(120, ChronoUnit.SECONDS);
            room.transitionToPhase(Phase.DAY, endsAt);

            return room;
        });

        // Atomically에서 만든 result 밖으로 가져올 수 없어서 이벤트에 쓰는 방식
        GameUserId mafiaTarget = updated.getGameState().night().mafiaTargetUserId();
        GameUserId doctorTarget = updated.getGameState().night().doctorTargetUserId();

        RoomNightState temp = new RoomNightState();
        if (mafiaTarget != null) temp.lockMafiaTarget(mafiaTarget);
        if (doctorTarget != null) temp.setDoctorTarget(doctorTarget);

        NightResolutionResult result = resolver.resolve(temp);

        eventPort.nightResolved(roomCode, updated.getVersion(), result.killedUserId(), result.saved());

        if (result.killedUserId() != null) {
            eventPort.playerStatusChanged(
                    roomCode,
                    updated.getVersion(),
                    result.killedUserId(),
                    false,
                    "NIGHT_KILLED"
            );
        }

        eventPort.phaseChanged(
                roomCode,
                updated.getVersion(),
                Phase.DAY,
                updated.getGameState().phaseEndsAt() // 이것도 GameState getter명에 맞춰야 함
        );
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
}
