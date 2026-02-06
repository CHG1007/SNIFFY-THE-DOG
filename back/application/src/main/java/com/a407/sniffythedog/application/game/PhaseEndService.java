package com.a407.sniffythedog.application.game;

import com.a407.sniffythedog.application.game.in.PhaseEndCommand;
import com.a407.sniffythedog.application.game.in.PhaseEndUseCase;
import com.a407.sniffythedog.application.game.out.GameMessagePort;
import com.a407.sniffythedog.application.gamelog.GameResultService;
import com.a407.sniffythedog.application.night.in.NightResolveCommand;
import com.a407.sniffythedog.application.night.in.NightResolveUseCase;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.vo.PhaseEndResult;
import com.a407.sniffythedog.domain.game.vo.PhaseTransitionResult;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Phase End 방식 - 클라이언트 트리거 Phase 전환 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PhaseEndService implements PhaseEndUseCase {

    private final RedisRoomPort redisRoomPort;
    private final GameMessagePort gameMessagePort;
    private final GameResultService gameResultService;
    private final NightResolveUseCase nightResolveUseCase;

    @Override
    public void execute(PhaseEndCommand command) {
        String roomCode = command.roomCode();
        RoomId roomId = RoomId.of(roomCode);

        // Phase enum 파싱
        Phase requestedPhase;
        try {
            requestedPhase = Phase.valueOf(command.phase());
        } catch (IllegalArgumentException e) {
            log.warn("[PhaseEnd] Invalid phase: {}", command.phase());
            return;
        }

        // NIGHT phase는 phase/end가 들어오면 서버에서 정산까지 처리한다.
        if (requestedPhase == Phase.NIGHT) {
            nightResolveUseCase.execute(new NightResolveCommand(
                    roomCode,
                    command.userId(),
                    command.requestId()));
            return;
        }

        final PhaseEndHolder holder = new PhaseEndHolder();

        // Redis 원자적 업데이트
        RoomSession updated = redisRoomPort.updateRoomAtomically(roomId, room -> {
            PhaseEndResult result = room.endPhase(requestedPhase);

            if (!result.success()) {
                log.info("[PhaseEnd] Ignored: roomCode={}, phase={}, reason={}",
                        roomCode, requestedPhase, result.ignoreReason());
                holder.ignored = true;
                return room;
            }

            holder.transition = result.transition();
            holder.newVersion = room.getVersion();
            holder.newPhase = room.getGameState().phase();
            holder.phaseEndsAt = room.getGameState().phaseEndsAt().toString();
            holder.round = room.getGameState().round();
            holder.startedAt = room.getStartedAt();
            holder.endedAt = room.getEndedAt();

            return room;
        });

        if (holder.ignored) {
            return; // 멱등성 - 이미 처리됨
        }

        holder.playerRoles = updated.getPlayers().entrySet().stream()
                .map(e -> Map.<String, Object>of(
                        "userId", e.getKey().value(),
                        "nickname", e.getValue().getDisplayName(),
                        "role", e.getValue().getGameRole() != null ? e.getValue().getGameRole().name() : "CITIZEN"))
                .collect(Collectors.toList());

        log.info("[PhaseEnd] Phase changed: roomCode={}, from={}, to={}, version={}",
                roomCode, requestedPhase, holder.newPhase, holder.newVersion);

        // 브로드캐스트
        broadcastPhaseChange(roomCode, holder);
    }

    private void broadcastPhaseChange(String roomCode, PhaseEndHolder holder) {
        // 2. Phase별 추가 이벤트 (결과 메시지를 먼저 보내야 프론트에서 페이즈 전환 시 바로 인지 가능)
        PhaseTransitionResult tr = holder.transition;

        if (tr != null) {
            // VOTE_1 결과
            if (tr.accusedUserId() != null) {
                Map<String, Object> vote1Result = new HashMap<>();
                vote1Result.put("version", holder.newVersion);
                vote1Result.put("accusedUserId", tr.accusedUserId().value());
                vote1Result.put("isTie", false);
                gameMessagePort.sendToRoom(roomCode, "VOTE1_RESULT", vote1Result);
            } else if (tr.isTie()) {
                Map<String, Object> vote1Result = new HashMap<>();
                vote1Result.put("version", holder.newVersion);
                vote1Result.put("accusedUserId", null);
                vote1Result.put("isTie", true);
                gameMessagePort.sendToRoom(roomCode, "VOTE1_RESULT", vote1Result);
            }

            // VOTE_2 결과 (찬반 투표)
            if (tr.vote2Approved() != null) {
                Map<String, Object> vote2Result = new HashMap<>();
                vote2Result.put("version", holder.newVersion);
                vote2Result.put("approved", tr.vote2Approved());
                vote2Result.put("executedUserId", tr.executedUserId() != null ? tr.executedUserId().value() : null);
                vote2Result.put("agree", tr.vote2YesCount());
                vote2Result.put("disagree", tr.vote2NoCount());
                gameMessagePort.sendToRoom(roomCode, "VOTE2_RESULT", vote2Result);

                // 처형 승인 시 플레이어 상태 변경 알림
                if (tr.vote2Approved() && tr.executedUserId() != null) {
                    Map<String, Object> statusChanged = new HashMap<>();
                    statusChanged.put("version", holder.newVersion);
                    statusChanged.put("userId", tr.executedUserId().value());
                    statusChanged.put("isAlive", false);
                    statusChanged.put("reason", "VOTE_EXECUTION");
                    gameMessagePort.sendToRoom(roomCode, "PLAYER_STATUS_CHANGED", statusChanged);
                }
            }

            // NIGHT 결과 (killedUserId가 있으면)
            if (tr.killedUserId() != null) {
                Map<String, Object> nightResult = new HashMap<>();
                nightResult.put("version", holder.newVersion);
                nightResult.put("killedUserId", tr.killedUserId().value());
                nightResult.put("saved", tr.saved());
                gameMessagePort.sendToRoom(roomCode, "NIGHT_RESULT", nightResult);
            }
        }

        // 1. PHASE_CHANGED 이벤트
        Map<String, Object> phasePayload = new HashMap<>();
        phasePayload.put("version", holder.newVersion);
        phasePayload.put("phase", holder.newPhase.name());
        phasePayload.put("phaseEndsAt", holder.phaseEndsAt);
        phasePayload.put("round", holder.round);

        gameMessagePort.sendToRoom(roomCode, "PHASE_CHANGED", phasePayload);

        // 게임 종료
        if (tr.winner() != null) {
            Map<String, Object> gameFinished = new HashMap<>();
            gameFinished.put("version", holder.newVersion);
            gameFinished.put("winnerTeam", tr.winner().name());
            gameFinished.put("mvpUserId", null);
            gameFinished.put("players", holder.playerRoles);
            gameMessagePort.sendToRoom(roomCode, "GAME_FINISHED", gameFinished);

            // 게임 결과 처리 (비동기) - GameHistory 생성 및 GameLog MongoDB 저장
            gameResultService.processGameResult(
                    roomCode,
                    tr.winner(),
                    holder.startedAt,
                    holder.endedAt != null ? holder.endedAt : Instant.now());
        }

    }

    private static class PhaseEndHolder {
        boolean ignored = false;
        PhaseTransitionResult transition;
        long newVersion;
        Phase newPhase;
        String phaseEndsAt;
        int round;
        Instant startedAt;
        Instant endedAt;
        List<Map<String, Object>> playerRoles;
    }
}
