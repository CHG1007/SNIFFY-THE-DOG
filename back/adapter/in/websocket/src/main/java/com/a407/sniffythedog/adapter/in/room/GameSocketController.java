package com.a407.sniffythedog.adapter.in.room;

import com.a407.sniffythedog.adapter.in.room.request.JoinRequest;
import com.a407.sniffythedog.adapter.in.room.request.KickReqeust;
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
    private final KickUserUseCase kickUserUseCase;
    private final RestartGameUseCase restartGameUseCase;
    private final PhaseEndUseCase phaseEndUseCase;

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

    @MessageMapping("/rooms/{roomCode}/kick")
    public void kickUser(
            @DestinationVariable String roomCode,
            @Payload KickReqeust kickReqeust,
            Principal principal
            ){
        Long hostUserId = Long.valueOf(principal.getName());

        KickUserCommand command = new KickUserCommand(
                roomCode,
                hostUserId,
                kickReqeust.targetUserId(),
                kickReqeust.requestId()
        );
        kickUserUseCase.execute(command);
    }

    /**
     * 게임 종료 후 대기실로 복귀
     */
    @MessageMapping("/rooms/{roomCode}/restart")
    public void restartGame(
            @DestinationVariable String roomCode,
            @Payload RestartRequest request,
            Principal principal
    ) {
        Long userId = Long.valueOf(principal.getName());

        RestartGameCommand command = new RestartGameCommand(
                roomCode,
                userId,
                request.requestId()
        );

        restartGameUseCase.execute(command);
    }

    public record RestartRequest(String requestId) {}

    /**
     * Phase End 방식 - 클라이언트가 Phase 종료를 트리거
     */
    @MessageMapping("/rooms/{roomCode}/phase/end")
    public void endPhase(
            @DestinationVariable String roomCode,
            @Payload PhaseEndRequest request,
            Principal principal
    ) {
        Long userId = Long.valueOf(principal.getName());

        PhaseEndCommand command = new PhaseEndCommand(
                roomCode,
                userId,
                request.phase(),
                request.requestId()
        );

        phaseEndUseCase.execute(command);
    }

    public record PhaseEndRequest(String phase, String requestId) {}
}
