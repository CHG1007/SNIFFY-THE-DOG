package com.a407.sniffythedog.application.game;

import com.a407.sniffythedog.application.game.in.SkipTimerCommand;
import com.a407.sniffythedog.application.game.in.SkipTimerUseCase;
import com.a407.sniffythedog.application.game.out.GameMessagePort;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * 타이머 스킵 서비스 — 현재 페이즈의 phaseEndsAt을 지금+3초로 갱신한 뒤 TIMER_UPDATED를 브로드캐스트.
 * 페이즈 전환이나 투표 상태는 변경하지 않음.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkipTimerService implements SkipTimerUseCase {

    private static final long SKIP_SECONDS = 3;

    private final RedisRoomPort redisRoomPort;
    private final GameMessagePort gameMessagePort;

    @Override
    public void execute(SkipTimerCommand command) {
        String roomCode = command.roomCode();
        RoomId roomId = RoomId.of(roomCode);

        Phase requestedPhase;
        try {
            requestedPhase = Phase.valueOf(command.phase());
        } catch (IllegalArgumentException e) {
            log.warn("[SkipTimer] 잘못된 페이즈: {}", command.phase());
            return;
        }

        // 원자적 갱신 후 새 종료 시각을 캡처
        final Instant[] newEndsAtHolder = { null };

        redisRoomPort.updateRoomAtomically(roomId, room -> {
            // 현재 페이즈가 요청된 페이즈와 다르면 무시 (이미 페이즈가 바뀜)
            if (room.getGameState().phase() != requestedPhase) {
                log.info("[SkipTimer] 무시됨: 현재 페이즈={}, 요청={}", room.getGameState().phase(), requestedPhase);
                return room;
            }

            // 이미 페이즈가 종료되었으면 무시
            if (room.getGameState().phaseEnded()) {
                log.info("[SkipTimer] 무시됨: 페이즈 이미 종료됨");
                return room;
            }

            Instant newEndsAt = Instant.now().plusSeconds(SKIP_SECONDS);
            newEndsAtHolder[0] = newEndsAt;

            room.updatePhaseEndsAt(newEndsAt);
            return room;
        });

        if (newEndsAtHolder[0] == null) return; // 무시됨

        log.info("[SkipTimer] 타이머 스킵 완료: roomCode={}, phase={}, newEndsAt={}",
                roomCode, requestedPhase, newEndsAtHolder[0]);

        // TIMER_UPDATED 브로드캐스트 — 페이즈 변경 이벤트가 아니므로 클라이언트 투표 상태를 초기화하지 않음
        Map<String, Object> payload = new HashMap<>();
        payload.put("phase", requestedPhase.name());
        payload.put("phaseEndsAt", newEndsAtHolder[0].toString());

        gameMessagePort.sendToRoom(roomCode, "TIMER_UPDATED", payload);
    }
}
