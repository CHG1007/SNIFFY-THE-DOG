package com.a407.sniffythedog.adapter.in.room;

import com.a407.sniffythedog.adapter.in.room.request.JoinRequest;
import com.a407.sniffythedog.application.game.in.JoinRoomCommand;
import com.a407.sniffythedog.application.game.in.JoinRoomUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class GameSocketController {

    private final JoinRoomUseCase joinRoomUseCase;

    @MessageMapping
    public void joinRoom(@DestinationVariable String roomCode,
                         @Payload JoinRequest request,
                         Principal principal, StompHeaderAccessor accessor){
        Long userId = Long.valueOf(principal.getName());

        accessor.getSessionAttributes().put("roomCode", roomCode);
        accessor.getSessionAttributes().put("userId", userId);

        JoinRoomCommand command = new JoinRoomCommand(
                roomCode, userId, request.nickname(), request.requestId()
        );

        joinRoomUseCase.execute(command);
    }
}
