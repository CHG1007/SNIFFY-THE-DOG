package com.a407.sniffythedog.adapter.in.room;

import com.a407.sniffythedog.adapter.in.common.response.SocketResponse;
import com.a407.sniffythedog.application.game.out.GameMessagePort;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class GameMessageAdapter implements GameMessagePort {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendToRoom(String roomCode, String type, Object payload) {
        SocketResponse<Object> response = SocketResponse.of(type, null, roomCode, payload);
        messagingTemplate.convertAndSend("/topic/rooms/" + roomCode, response);
    }

    @Override
    public void sendToUser(String userId, String roomCode, String requestId, String type, Object payload) {
        SocketResponse<Object> response = SocketResponse.of(type, requestId, roomCode, payload);
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/rooms/" + roomCode,
                response
        );
    }

    @Override
    public void sendToMafia(String roomCode, String type, Object payload) {
        SocketResponse<Object> response = SocketResponse.of(type, null, roomCode, payload);
        messagingTemplate.convertAndSend("/topic/rooms/" + roomCode + "/mafia", response);
    }
}
