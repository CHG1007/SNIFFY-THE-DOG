package com.a407.sniffythedog.application.game;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.game.in.*;
import com.a407.sniffythedog.application.game.out.GameMessagePort;
import com.a407.sniffythedog.application.gamelog.GameResultService;
import com.a407.sniffythedog.application.gamelog.out.GameLogRedisPort;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.enums.RoomStatus;
import com.a407.sniffythedog.domain.game.enums.Winner;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.PhaseTiming;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import com.a407.sniffythedog.domain.gamelog.vo.PlayerResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService implements JoinRoomUseCase, LeaveRoomUseCase, SyncRoomUseCase, SetReadyUseCase, KickUserUseCase, RestartGameUseCase {

    private final RedisRoomPort redisRoomPort;
    private final GameMessagePort gameMessagePort;
    private final GameLogRedisPort gameLogRedisPort;
    private final GameResultService gameResultService;

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
                        if (room.getPlayer(gameUserId) != null) {
                            return room; // 이미 참가 중이면 변경 없이 리턴
                        }
                        room.joinPlayer(gameUserId, nickname);
                        return room;
                    });
            //방입장 성공 개인 응답
            RoomState roomState = RoomState.from(updatedRoom);
            Map<String, Object> ackData = Map.of(
                    "roomState", roomState,
                    "my", MyInfo.from(updatedRoom.getPlayer(gameUserId))
            );
            gameMessagePort.sendToUser(String.valueOf(userId),
                    roomCode,
                    requestId,
                    "JOIN_ACK",
                    ackData)
            ;

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

            gameMessagePort.sendToUser(
                    String.valueOf(userId),
                    roomCode,
                    requestId,
                    "JOIN_REJECTED",
                    rejectData
            );

        } catch (Exception e) {
            // 기타 예외
            e.printStackTrace();
            Map<String, Object> errorData = Map.of(
                    "code", "INTERNAL_ERROR",
                    "message", "일시적인 오류가 발생했습니다.",
                    "retryable", true
            );

            gameMessagePort.sendToUser(
                    String.valueOf(userId),
                    roomCode,
                    requestId,
                    "JOIN_REJECTED",
                    errorData
            );

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
                Phase currentPhase = room.getGameState().phase();

                // 설정 단계(COUNTDOWN, ASSIGN_ROLE)에서는 죽음 처리하지 않음
                // (페이지 전환으로 인한 WebSocket 재연결 시 죽음 방지)
                boolean isSetupPhase = (currentPhase == Phase.COUNTDOWN || currentPhase == Phase.ASSIGN_ROLE);

                if (!isSetupPhase && player.isAlive()) {
                    // 실제 게임 중에만 죽음 처리
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

                // 설정 단계가 아닐 때만 승리 체크
                if (!isSetupPhase) {
                    room.checkAndEndIfGameOver().ifPresent(winner -> {
                        holder.finished = true;
                        holder.winnerTeam = winner.name();
                    });
                }
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
            java.util.HashMap<String, Object> finishedMsg = new java.util.HashMap<>();
            finishedMsg.put("version", updated.getVersion());
            finishedMsg.put("winnerTeam", holder.winnerTeam);
            finishedMsg.put("mvpUserId", null);
            finishedMsg.put("players", updated.getPlayers().entrySet().stream()
                    .map(e -> Map.of(
                            "userId", e.getKey().value(),
                            "nickname", e.getValue().getDisplayName(),
                            "role", e.getValue().getGameRole() != null ? e.getValue().getGameRole().name() : "CITIZEN"
                    ))
                    .collect(Collectors.toList()));
            gameMessagePort.sendToRoom(roomCode, "GAME_FINISHED", finishedMsg);

            gameResultService.processGameResult(
                    roomCode,
                    Winner.valueOf(holder.winnerTeam),
                    updated.getStartedAt(),
                    updated.getEndedAt() != null ? updated.getEndedAt() : Instant.now()
            );
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
        gameMessagePort.sendToUser(
                String.valueOf(userId),
                roomCode,
                requestId,
                "ROOM_SNAPSHOT",
                snapshot
        );

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
            final GameStartHolder startHolder = new GameStartHolder();

            RoomSession updatedRoom = redisRoomPort.updateRoomAtomically(roomId, room -> {
                PlayerState player = room.getPlayer(gameUserId);
                if (player == null) throw ApplicationException.of(ExceptionType.FORBIDDEN);
                player.setReady(ready);

                // Phase End 방식: 모두 준비되면 즉시 게임 시작 (COUNTDOWN phase)
                if (room.canStart()) {
                    room.getPlayers().values().forEach(PlayerState::revive);
                    room.startGame(GAME_TIMING);
                    startHolder.gameStarted = true;
                }

                return room;
            });

            handleReadyUpdateMessage(updatedRoom, roomCode, userId, ready);

            // 게임이 시작되었으면 역할 배정 및 PHASE_CHANGED 브로드캐스트
            if (startHolder.gameStarted) {
                log.info("[SetReady] Game started - roomCode={}, phase={}", roomCode, updatedRoom.getGameState().phase());

                // 게임 로그 초기화
                List<PlayerResult> initialPlayers = updatedRoom.getPlayers().values().stream()
                        .map(p -> PlayerResult.of(
                                p.getUserId().value(),
                                p.getDisplayName(),
                                p.getGameRole(),
                                true
                        ))
                        .collect(Collectors.toList());
                gameLogRedisPort.initGameLog(roomCode, initialPlayers, Instant.now());

                // 각 플레이어에게 역할 정보 전송 (개인 채널)
                sendRoleAssignments(updatedRoom, roomCode);

                // PHASE_CHANGED 브로드캐스트 (COUNTDOWN phase)
                Map<String, Object> phasePayload = Map.of(
                        "version", updatedRoom.getVersion(),
                        "phase", updatedRoom.getGameState().phase().name(),
                        "phaseEndsAt", updatedRoom.getGameState().phaseEndsAt(),
                        "round", updatedRoom.getGameState().round()
                );
                gameMessagePort.sendToRoom(roomCode, "PHASE_CHANGED", phasePayload);
            }

        } catch (ApplicationException e) {
            gameMessagePort.sendToUser(
                    String.valueOf(userId),
                    roomCode,
                    requestId,
                    "ERROR",
                    Map.of("message", e.getMessage())
            );
        } catch(Exception e) {
            e.printStackTrace();
            gameMessagePort.sendToUser(
                    String.valueOf(userId),
                    roomCode,
                    requestId,
                    "ERROR",
                    Map.of("message", "Internal Error")
            );
        }

    }

    private static class GameStartHolder {
        boolean gameStarted = false;
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

    /**
     * 각 플레이어에게 역할 정보 전송.
     * 마피아 플레이어에게는 동료 목록(mafiaMembers)을 함께 전달하여
     * 밤에 마피아끼리 화상 연결할 수 있도록 한다.
     */
    private void sendRoleAssignments(RoomSession room, String roomCode) {
        // 마피아 멤버 userId 목록 추출
        List<Long> mafiaMembers = room.getPlayers().entrySet().stream()
                .filter(e -> e.getValue().getGameRole().name().equals("MAFIA"))
                .map(e -> e.getKey().value())
                .collect(Collectors.toList());

        room.getPlayers().forEach((userId, player) -> {
            int aiChanceRemaining = player.getGameRole().name().equals("CITIZEN") ? 2 : 0;

            Map<String, Object> roleData;
            if (player.getGameRole().name().equals("MAFIA")) {
                // 마피아: 동료 목록 포함
                roleData = Map.of(
                        "role", player.getGameRole().name(),
                        "aiChanceRemaining", aiChanceRemaining,
                        "mafiaMembers", mafiaMembers
                );
            } else {
                roleData = Map.of(
                        "role", player.getGameRole().name(),
                        "aiChanceRemaining", aiChanceRemaining
                );
            }

            gameMessagePort.sendToUser(
                    String.valueOf(userId.value()),
                    roomCode,
                    "role-" + System.currentTimeMillis(),
                    "ROLE_ASSIGNED",
                    roleData
            );
        });
    }

    @Override
    public void execute(KickUserCommand command) {
        String roomCode = command.roomCode();
        Long hostUserId = command.hostUserId();
        Long targetUserId = command.targetUserId();
        String requestId = command.requestId();

        RoomId roomId = new RoomId(roomCode);
        GameUserId hostId = new GameUserId(hostUserId);
        GameUserId targetId = new GameUserId(targetUserId);
        try{
            RoomSession updatedRoom = redisRoomPort.updateRoomAtomically(roomId, room ->{
                if(!room.getHostUserId().equals(hostId)){
                    throw ApplicationException.of(ExceptionType.FORBIDDEN, "방장만 강퇴할 수 있습니다");
                }
                if (room.getStatus() != RoomStatus.WAITING) {
                    throw ApplicationException.of(ExceptionType.INVALID_GAME_STATE, "게임 대기 중에만 강퇴할 수 있습니다.");
                }
                if (hostId.equals(targetId)) {
                    throw ApplicationException.of(ExceptionType.INVALID_REQUEST, "자기 자신을 강퇴할 수 없습니다.");
                }

                room.leavePlayer(targetId);

                return room;
            });

            gameMessagePort.sendToUser(
                    String.valueOf(targetUserId),
                    roomCode,
                    requestId,
                    "KICKED",
                    Map.of("reason", "방장에 의해 강퇴되었습니다.")
            );
            RoomState roomState = RoomState.from(updatedRoom);
            Map<String, Object> leaveMessage = Map.of(
                    "version", updatedRoom.getVersion(),
                    "userId", targetUserId,
                    "roomState", roomState
            );
            gameMessagePort.sendToRoom(roomCode, "ROOM_PLAYER_LEFT", leaveMessage);

        } catch (ApplicationException e){
            gameMessagePort.sendToUser(
                    String.valueOf(hostUserId),
                    roomCode,
                    requestId,
                    "ERROR",
                    Map.of("message", e.getMessage())
            );
        } catch (Exception e) {
            gameMessagePort.sendToUser(
                    String.valueOf(hostUserId),
                    roomCode,
                    requestId,
                    "ERROR",
                    Map.of("message", "강퇴 처리 중 오류가 발생했습니다.")
            );
        }
    }

    //todo: 게임종료 메서드 추가 게임 종료시 redis에 있는 로그 mongoDB로 로그 전송

    /**
     * 게임 종료 후 대기실로 복귀
     */
    @Override
    public void execute(RestartGameCommand command) {
        String roomCode = command.roomCode();
        Long userId = command.userId();
        String requestId = command.requestId();

        RoomId roomId = new RoomId(roomCode);
        GameUserId gameUserId = new GameUserId(userId);

        try {
            RoomSession updatedRoom = redisRoomPort.updateRoomAtomically(roomId, room -> {
                // 게임이 끝난 상태에서만 리셋 가능
                if (room.getStatus() != RoomStatus.ENDED) {
                    throw ApplicationException.of(ExceptionType.INVALID_GAME_STATE, "게임이 종료된 상태에서만 대기실로 복귀할 수 있습니다.");
                }

                // 방에 있는 플레이어만 요청 가능
                if (room.getPlayer(gameUserId) == null) {
                    throw ApplicationException.of(ExceptionType.FORBIDDEN, "방에 참가 중이 아닙니다.");
                }

                room.resetForNewGame();
                return room;
            });

            // 전체 브로드캐스트: 대기실로 복귀 알림
            RoomState roomState = RoomState.from(updatedRoom);
            Map<String, Object> restartData = Map.of(
                    "version", updatedRoom.getVersion(),
                    "roomState", roomState
            );
            gameMessagePort.sendToRoom(roomCode, "GAME_RESTARTED", restartData);

        } catch (ApplicationException e) {
            gameMessagePort.sendToUser(
                    String.valueOf(userId),
                    roomCode,
                    requestId,
                    "ERROR",
                    Map.of("message", e.getMessage())
            );
        } catch (Exception e) {
            gameMessagePort.sendToUser(
                    String.valueOf(userId),
                    roomCode,
                    requestId,
                    "ERROR",
                    Map.of("message", "대기실 복귀 중 오류가 발생했습니다.")
            );
        }
    }
}
