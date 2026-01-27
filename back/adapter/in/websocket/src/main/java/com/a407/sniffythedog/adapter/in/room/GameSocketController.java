package com.a407.sniffythedog.adapter.in.room;

import com.a407.sniffythedog.adapter.in.room.request.JoinRequest;
import com.a407.sniffythedog.adapter.in.room.request.SetReadyRequest;
import com.a407.sniffythedog.adapter.in.room.request.SyncRequest;
import com.a407.sniffythedog.application.game.in.*;
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
    private final LeaveRoomUseCase leaveRoomUseCase;
    private final SyncRoomUseCase syncRoomUseCase;
    private final SetReadyUseCase setReadyUseCase;

    @MessageMapping("/rooms/{roomCode}/join")
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

    @MessageMapping("/rooms/{roomCode}/leave")
    public void leaveRoom(@DestinationVariable String roomCode, Principal principal){
        Long userId = Long.valueOf(principal.getName());

        LeaveRoomCommand command = new LeaveRoomCommand(roomCode, userId);
        leaveRoomUseCase.execute(command);
    }

    @MessageMapping("/rooms/{roomCode}/sync")
    public void sync(@DestinationVariable String roomCode,
                     @Payload SyncRequest request,
                     Principal principal){
        Long userId = Long.parseLong(principal.getName());

        SyncRoomCommand command = new SyncRoomCommand(
                roomCode,
                userId,
                request.requestId(),
                request.lastKnownVersion()
        );
        syncRoomUseCase.execute(command);

    }

    @MessageMapping("/rooms/{roomCode}/ready")
    public void setReady(
            @DestinationVariable String roomCode,
            @Payload SetReadyRequest request,
            Principal principal
    ) {
        Long userId = Long.parseLong(principal.getName());

        SetReadyCommand command = new SetReadyCommand(
                roomCode,
                userId,
                request.ready(),
                request.requestId()
        );

        setReadyUseCase.execute(command);
    }

}
