package com.a407.sniffythedog.application.game;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.game.in.*;
import com.a407.sniffythedog.application.game.out.GameMessagePort;
import com.a407.sniffythedog.application.game.scheduler.PhaseScheduler;
import com.a407.sniffythedog.application.game.scheduler.event.GameStartEvent;
import com.a407.sniffythedog.application.game.scheduler.event.PhaseTimeoutEvent;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.enums.RoomStatus;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.PhaseTiming;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GameService implements JoinRoomUseCase, LeaveRoomUseCase, SyncRoomUseCase, SetReadyUseCase {

    private final RedisRoomPort redisRoomPort;
    private final GameMessagePort gameMessagePort;
    private final PhaseScheduler phaseScheduler;

    private static final PhaseTiming GAME_TIMING = new PhaseTiming(60, 30, 30, 15, 30);

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

        RoomId roomId = RoomId.of(roomCode);
        GameUserId gameUserId = new GameUserId(userId);

        final LeaveHolder holder = new LeaveHolder();

        RoomSession updated = redisRoomPort.updateRoomAtomically(roomId, room -> {

            // 방에 없는 사람 방지
            PlayerState player = room.getPlayer(gameUserId);
            if (player == null) {
                throw ApplicationException.of(ExceptionType.NOT_IN_ROOM); // 없으면 BAD_REQUEST로 바꿔도 됨
            }

            // WAITING: 그냥 제거
            if (room.getStatus() == RoomStatus.WAITING) {
                room.leavePlayer(gameUserId);
                holder.leftUserId = userId;
            }

            // PLAYING: 탈주 = 사망 처리
            else if (room.getStatus() == RoomStatus.PLAYING) {
                // 살아있으면 죽이고(이미 죽은 사람이면 그냥 넘어감)
                if (player.isAlive()) {
                    room.killPlayer(gameUserId);
                    holder.killed = true;
                    holder.killedUserId = userId;
                    holder.killReason = "DISCONNECTED";
                }

                // 방장이 나가면 위임 (게임 중이면 host 유지하면 곤란할 수 있음)
                if (room.getHostUserId().equals(gameUserId)) {
                    // 남아있는 사람 중 한 명에게 위임
                    GameUserId newHost = room.getPlayers().keySet().stream()
                            .filter(id -> !id.equals(gameUserId))
                            .findFirst()
                            .orElse(null);

                    if (newHost != null) {
                        room.transferHost(newHost);
                    }
                }

                holder.leftUserId = userId;

                // 승리 체크 + 종료 반영
                room.checkAndEndIfGameOver().ifPresent(winner -> {
                    holder.finished = true;
                    holder.winnerTeam = winner.name();
                });
            }
            else {
                throw ApplicationException.of(ExceptionType.ROOM_NOT_JOINABLE);
            }

            if (room.getPlayerCount() == 0) {
                holder.deleteRoom = true;
            }

            return room;
        });

        if (holder.deleteRoom) {
            redisRoomPort.deleteRoom(roomCode);
            // todo: 스케줄러 취소
            return;
        }

        RoomState roomState = RoomState.from(updated);

        // 1) 나감 브로드캐스트
        Map<String, Object> leaveMessage = Map.of(
                "version", updated.getVersion(),
                "userId", userId,
                "roomState", roomState
        );
        gameMessagePort.sendToRoom(roomCode, "ROOM_PLAYER_LEFT", leaveMessage);

        // 2) 게임 중 탈주를 사망 처리했다면 상태 변경 이벤트도 같이
        if (holder.killed) {
            Map<String, Object> statusMsg = Map.of(
                    "version", updated.getVersion(),
                    "userId", holder.killedUserId,
                    "isAlive", false,
                    "reason", holder.killReason
            );
            gameMessagePort.sendToRoom(roomCode, "PLAYER_STATUS_CHANGED", statusMsg);
        }

        // 3) 종료면 GAME_FINISHED
        if (holder.finished) {
            Map<String, Object> finishedMsg = Map.of(
                    "version", updated.getVersion(),
                    "winnerTeam", holder.winnerTeam,
                    "mvpUserId", null
            );
            gameMessagePort.sendToRoom(roomCode, "GAME_FINISHED", finishedMsg);
        }
    }

    private static class LeaveHolder {
        Long leftUserId;

        boolean killed;
        Long killedUserId;
        String killReason;

        boolean finished;
        String winnerTeam;

        boolean deleteRoom;
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

        phaseScheduler.cancelSchedule(roomCode);

        gameMessagePort.sendToRoom(roomCode, "GAME_COUNTDOWN", Map.of("seconds", 3));

        Instant startTime = Instant.now().plusSeconds(3);
        phaseScheduler.scheduleEvent(
                roomCode,
                startTime,
                new GameStartEvent(roomCode, version)
        );

    }

    private void cancelAutoStart(String roomCode){
        boolean cancelled = phaseScheduler.cancelSchedule(roomCode);

        if (cancelled) {

            gameMessagePort.sendToRoom(roomCode, "GAME_COUNTDOWN_CANCELLED", Map.of(
                    "message", "플레이어가 준비를 취소하여 시작이 중단되었습니다."
            ));
        }
    }

    @EventListener
    public void handlePhaseTimeout(PhaseTimeoutEvent event){
        advancePhase(event.roomCode(), event.version());
    }

    @EventListener
    public void handleGameStart(GameStartEvent event) {
        startGameByKey(event.roomCode(), event.version());
    }

    private void startGameByKey(String roomCode, long expectedVersion) {
        RoomId roomId = new RoomId(roomCode);

        try {
            RoomSession updatedRoom = redisRoomPort.updateRoomAtomically(roomId, room -> {
                if (room.getVersion() != expectedVersion) {
                    return room;
                }

                room.startGame(GAME_TIMING);
                return room;
            });

            if (updatedRoom.getVersion() != expectedVersion + 1) {
                cancelAutoStart(roomCode);
                return;
            }

            handlePhaseChangeMessages(updatedRoom, roomCode);

        } catch (Exception e) {
            gameMessagePort.sendToRoom(roomCode, "ERROR", Map.of("message", "게임 시작 중 오류가 발생했습니다."));
        }
    }

    private void advancePhase(String roomCode, long expectedVersion) {
        RoomId roomId = new RoomId(roomCode);
        try {
            RoomSession updatedRoom = redisRoomPort.updateRoomAtomically(roomId, room -> {

                if (room.getVersion() != expectedVersion) {
                    return room;
                }

                room.proceedToNextPhase(GAME_TIMING);
                return room;
            });


            if (updatedRoom.getVersion() != expectedVersion+1) return;

            handlePhaseChangeMessages(updatedRoom, roomCode);
        } catch (Exception e) {
            gameMessagePort.sendToRoom(roomCode, "ERROR", Map.of("message", "페이즈 전환 중 오류가 발생했습니다."));
        }

    }

    private void handlePhaseChangeMessages(RoomSession room, String roomCode) {

        if (room.getStatus() == RoomStatus.ENDED) {
            //todo: 게임 종료
            return;
        }

        Map<String, Object> phasePayload = Map.of(
                "version", room.getVersion(),
                "phase", room.getGameState().phase(),
                "phaseEndsAt", room.getGameState().phaseEndsAt()
        );
        gameMessagePort.sendToRoom(roomCode, "PHASE_CHANGED", phasePayload);


        phaseScheduler.scheduleEvent(roomCode, room.getGameState().phaseEndsAt(), new PhaseTimeoutEvent(roomCode, room.getVersion()));
    }

    //todo: 게임종료 메서드 추가


}
