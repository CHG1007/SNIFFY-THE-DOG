package com.a407.sniffythedog.adapter.out.rdb.game.repository;
import com.a407.sniffythedog.application.night.out.NightEventPort;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

// NightEventPort의 구현체
@Component
@RequiredArgsConstructor
public class NightEventPublisherAdapter implements NightEventPort {

    private final SimpMessagingTemplate template;

    // topic(roomCode) : 방 전체가 브로드캐스트 , 모든 유저가 구독함
    private String topic(String roomCode) { return "/topic/rooms/" + roomCode; }
    // mafiaTopic : 마피아 끼리만
    private String mafiaTopic(String roomCode) { return "/topic/rooms/" + roomCode + "/mafia"; }
    // 특정 사람한테만 !
    private String userQueue(String roomCode) { return "/user/queue/rooms/" + roomCode; }


    @Override
    public void mafiaTargetLocked(String roomCode, long version, GameUserId targetUserId) {
        // 마피아에 해당하는 사람들에게 payload보내라 !
        // convertAndSend(destination, payload)
        template.convertAndSend(mafiaTopic(roomCode),
                // payload를 통일된 형태로 JSON 을 보냄
                envelope("MAFIA_RESULT", roomCode,
                        Map.of("version", version, "targetUserId", targetUserId.value())));
    }

    @Override
    public void policeResult(String roomCode, GameUserId toPolice, GameUserId targetUserId, boolean isMafia) {
        // convertAndSendToUser은 특정 한 사람에게만 보냄
        // convertAndSendToUser(user, destination, payload)
        template.convertAndSendToUser(String.valueOf(toPolice.value()), userQueue(roomCode),
                envelope("POLICE_RESULT", roomCode,
                        Map.of("targetUserId", targetUserId, "isMafia", isMafia)));
    }

    @Override
    public void nightResolved(String roomCode, long version, GameUserId killedUserId, boolean saved) {
        template.convertAndSend(topic(roomCode),
                envelope("NIGHT_RESOLVED", roomCode,
                        Map.of("version", version, "killedUserId", killedUserId, "saved", saved)));
    }

    @Override
    public void playerStatusChanged(String roomCode, long version, GameUserId userId, boolean isAlive, String reason) {
        template.convertAndSend(topic(roomCode),
                envelope("PLAYER_STATUS_CHANGED", roomCode,
                        Map.of("version", version, "userId", userId, "isAlive", isAlive, "reason", reason)));
    }

    @Override
    public void phaseChanged(String roomCode, long version, Phase phase, Instant phaseEndsAt) {
        template.convertAndSend(topic(roomCode),
                envelope("PHASE_CHANGED", roomCode,
                        Map.of("version", version, "phase", phase.name(), "phaseEndsAt", phaseEndsAt.toString())));
    }

    private Map<String, Object> envelope(String type, String roomCode, Map<String, Object> data) {
        return Map.of("type", type, "roomCode", roomCode, "timestamp", Instant.now().toString(), "data", data);
    }
}
