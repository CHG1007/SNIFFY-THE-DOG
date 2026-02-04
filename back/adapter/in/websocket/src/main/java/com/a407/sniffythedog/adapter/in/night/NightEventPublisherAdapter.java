package com.a407.sniffythedog.adapter.in.night;

import com.a407.sniffythedog.adapter.in.common.response.SocketResponse;
import com.a407.sniffythedog.application.night.out.NightEventPort;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class NightEventPublisherAdapter implements NightEventPort {

    private final SimpMessagingTemplate template;

    private String topic(String roomCode) { return "/topic/rooms/" + roomCode; }
    private String mafiaTopic(String roomCode) { return "/topic/rooms/" + roomCode + "/mafia"; }
    private String userQueue(String roomCode) { return "/queue/rooms/" + roomCode; }

    @Override
    public void mafiaTargetLocked(String roomCode, String requestId, long version, GameUserId targetUserId) {
        Map<String, Object> data = Map.of(
                "version", version,
                "targetUserId", targetUserId.value()
        );
        // SocketResponse 사용
        SocketResponse<Object> response = SocketResponse.of("MAFIA_TARGET_LOCKED", requestId, roomCode, data);
        template.convertAndSend(mafiaTopic(roomCode), response);
    }

    @Override
    public void policeResult(String roomCode, String requestId, GameUserId toPolice, GameUserId targetUserId, boolean isMafia) {
        Map<String, Object> data = Map.of(
                "targetUserId", targetUserId.value(),
                "isMafia", isMafia
        );
        SocketResponse<Object> response = SocketResponse.of("POLICE_RESULT", requestId, roomCode, data);
        template.convertAndSendToUser(
                String.valueOf(toPolice.value()),
                userQueue(roomCode),
                response
        );
    }

    @Override
    public void nightResolved(String roomCode, String requestId, long version, GameUserId killedUserId, boolean saved) {
        // null safe 처리
        Map<String, Object> data = new HashMap<>();
        data.put("version", version);
        data.put("killedUserId", killedUserId != null ? killedUserId.value() : null);
        data.put("saved", saved);

        SocketResponse<Object> response = SocketResponse.of("NIGHT_RESOLVED", requestId, roomCode, data);
        template.convertAndSend(topic(roomCode), response);
    }

    @Override
    public void playerStatusChanged(String roomCode, String requestId, long version, GameUserId userId, boolean isAlive, String reason) {
        Map<String, Object> data = Map.of(
                "version", version,
                "userId", userId.value(),
                "isAlive", isAlive,
                "reason", reason
        );
        SocketResponse<Object> response = SocketResponse.of("PLAYER_STATUS_CHANGED", requestId, roomCode, data);
        template.convertAndSend(topic(roomCode), response);
    }

    @Override
    public void phaseChanged(String roomCode, String requestId, long version, Phase phase, Instant phaseEndsAt) {
        Map<String, Object> data = Map.of(
                "version", version,
                "phase", phase.name(),
                "phaseEndsAt", phaseEndsAt.toString()
        );
        SocketResponse<Object> response = SocketResponse.of("PHASE_CHANGED", requestId, roomCode, data);
        template.convertAndSend(topic(roomCode), response);
    }
}