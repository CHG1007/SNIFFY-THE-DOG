package com.a407.sniffythedog.application.game;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.game.in.*;
import com.a407.sniffythedog.application.game.out.GameMessagePort;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class GameService implements JoinRoomUseCase, LeaveRoomUseCase, SyncRoomUseCase, SetReadyUseCase {

    private final RedisRoomPort redisRoomPort;
    private final GameMessagePort gameMessagePort;

    @Override
    public void execute(JoinRoomCommand command) {
        String roomCode = command.roomCode();
        Long userId = command.userId();
        String nickname = command.nickname();
        String requestId = command.requestId();

        GameUserId gameUserId = new GameUserId(userId);
        RoomId roomId = new RoomId(roomCode);

        try {
            RoomSession updatedRoom = redisRoomPort
                    .updateRoomAtomically(roomId, room -> {
                        room.joinPlayer(gameUserId, nickname);
                        return room;
                    });
            //방입장 성공 개인 응답
            RoomState roomState = RoomState.from(updatedRoom);
            Map<String, Object> ackData = Map.of(
                    "roomState", roomState,
                    "my", MyInfo.from(updatedRoom.getPlayer(gameUserId))
            );
            gameMessagePort.sendToUser(String.valueOf(userId), roomCode, requestId, "JOIN_ACK", ackData);

            //방입장 성공 전체 브로드케스트
            PlayerSummary newPlayer = PlayerSummary.from(updatedRoom.getPlayer(gameUserId));
            Map<String, Object> joinData = Map.of(
                    "version", updatedRoom.getVersion(),
                    "player", newPlayer,
                    "roomState", roomState
            );
            gameMessagePort.sendToRoom(roomCode, "ROOM_PLAYER_JOINED", joinData);

        } catch (ApplicationException e) {
            //방 입장 실패
            Map<String, Object> rejectData = Map.of(
                    "code", e.getHttpStatusCode(),
                    "message", e.getMessage(),
                    "retryable", true
            );
            gameMessagePort.sendToUser(String.valueOf(userId), roomCode, requestId, "JOIN_REJECTED", rejectData);
        } catch (Exception e) {
            // 기타 예외
            e.printStackTrace();
            Map<String, Object> errorData = Map.of(
                    "code", "INTERNAL_ERROR",
                    "message", "일시적인 오류가 발생했습니다.",
                    "retryable", true
            );
            gameMessagePort.sendToUser(String.valueOf(userId), roomCode, requestId, "JOIN_REJECTED", errorData);
        }

    }

    @Override
    public void execute(LeaveRoomCommand command) {
        String roomCode = command.roomCode();
        Long userId = command.userId();

        RoomSession room = redisRoomPort.loadRoom(RoomId.of(roomCode))
                .orElseThrow(() -> ApplicationException.of(ExceptionType.ROOM_NOT_FOUND));

        GameUserId gameUserId = new GameUserId(userId);
        room.leavePlayer(gameUserId);

        if (room.getPlayerCount() == 0) {
            redisRoomPort.deleteRoom(roomCode);
            //todo: 스케줄러 취소
        } else {
            redisRoomPort.saveRoom(room);

            RoomState roomState = RoomState.from(room);
            Map<String, Object> leaveMessage = Map.of("version", room.getVersion(), "userId", userId, "roomState", roomState);
            gameMessagePort.sendToRoom(roomCode, "ROOM_PLAYER_LEFT", leaveMessage);

        }
    }

    @Override
    public void execute(SyncRoomCommand command) {
        String roomCode = command.roomCode();
        Long userId = command.userId();
        String requestId = command.requestId();

        RoomSession room = redisRoomPort.loadRoom(RoomId.of(roomCode))
                .orElseThrow(() -> ApplicationException.of(ExceptionType.ROOM_NOT_FOUND));

        GameUserId gameUserId = new GameUserId(userId);
        PlayerState myPlayer = room.getPlayer(gameUserId);

        if (myPlayer == null) {
            throw ApplicationException.of(ExceptionType.FORBIDDEN);
        }

        RoomState roomState = RoomState.from(room);
        RoomSnapshot snapshot = RoomSnapshot.of(roomState, myPlayer);
        gameMessagePort.sendToUser(String.valueOf(userId), roomCode, requestId, "ROOM_SNAPSHOT", snapshot);

    }

    @Override
    public void execute(SetReadyCommand command) {
        String roomCode = command.roomCode();
        Long userId = command.userId();
        boolean ready = command.ready();
        String requestId = command.requestId();

        GameUserId gameUserId = new GameUserId(userId);
        RoomId roomId = new RoomId(roomCode);

        try {
            RoomSession updatedRoom = redisRoomPort.updateRoomAtomically(roomId, room -> {
                PlayerState player = room.getPlayer(gameUserId);
                if (player == null) throw ApplicationException.of(ExceptionType.FORBIDDEN);
                player.setReady(ready);
                return room;
            });

            handleReadyUpdateMessage(updatedRoom, roomCode, userId, ready);

            //자동 시작 여부 확인
            if(updatedRoom.canStart()){
                scheduleAutoStart(roomCode, updatedRoom.getVersion());
            } else {
                cancelAutoStart(roomCode);
            }

        } catch (ApplicationException e) {
            gameMessagePort.sendToUser(String.valueOf(userId), roomCode, requestId, "ERROR", Map.of("message", e.getMessage()));
        } catch(Exception e) {
            e.printStackTrace();
            gameMessagePort.sendToUser(String.valueOf(userId), roomCode, requestId, "ERROR", Map.of("message", "Internal Error"));
        }

    }

    private void handleReadyUpdateMessage(RoomSession room, String roomCode, Long userId, boolean ready) {
        RoomState roomState = RoomState.from(room);
        Map<String, Object> readyMessage = Map.of(
                "version", room.getVersion(),
                "userId", userId,
                "ready", ready,
                "roomState", roomState
        );
        gameMessagePort.sendToRoom(roomCode, "ROOM_READY_UPDATED", readyMessage);
    }

    private void scheduleAutoStart(String roomCode, Long version) {
        //todo: 스케줄러 취소
        log.info("Room {} Auto-Start Countdown Initiated (3 seconds)", roomCode);
        gameMessagePort.sendToRoom(roomCode, "GAME_COUNTDOWN", Map.of("seconds", 3));

        Instant startTime = Instant.now().plusSeconds(3);
        //todo: 스케줄러 등록
    }

    private void cancelAutoStart(String roomCode){
        boolean cancelled = true;//todo: 스케줄러 취소

        if (cancelled) {
            log.info("Room {} Auto-Start Cancelled", roomCode);

            // [알림] 방 전체에 "카운트다운 중단!" 전송 -> 프론트에서 카운트다운 UI 제거
            gameMessagePort.sendToRoom(roomCode, "GAME_COUNTDOWN_CANCELLED", Map.of(
                    "message", "플레이어가 준비를 취소하여 시작이 중단되었습니다."
            ));
        }
    }

}
