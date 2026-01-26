package com.a407.sniffythedog.application.game;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.game.in.*;
import com.a407.sniffythedog.application.game.out.GameMessagePort;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class GameService implements JoinRoomUseCase, LeaveRoomUseCase {

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

        } catch(ApplicationException e){
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

        if(room.getPlayerCount() == 0){
            redisRoomPort.deleteRoom(roomCode);
            //todo: 스케줄러 취소
        } else {
            redisRoomPort.saveRoom(room);

            RoomState roomState = RoomState.from(room);
            Map<String, Object> leaveMessage = Map.of("version", room.getVersion(), "userId", userId, "roomState", roomState);
            gameMessagePort.sendToRoom(roomCode, "ROOM_PLAYER_LEFT", leaveMessage);

        }
    }
}
