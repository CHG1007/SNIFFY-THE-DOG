package com.a407.sniffythedog.application.game;

import com.a407.sniffythedog.application.game.in.PhaseEndCommand;
import com.a407.sniffythedog.application.game.in.PhaseEndUseCase;
import com.a407.sniffythedog.application.game.out.GameMessagePort;
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

import java.util.HashMap;
import java.util.Map;

/**
 * Phase End 방식 - 클라이언트 트리거 Phase 전환 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PhaseEndService implements PhaseEndUseCase {

    private final RedisRoomPort redisRoomPort;
    private final GameMessagePort gameMessagePort;
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

        // NIGHT은 phase/end로 들어오면 서버에서 정산까지 처리한다.
        if (requestedPhase == Phase.NIGHT) {
            nightResolveUseCase.resolve(roomCode);
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

            return room;
        });

        if (holder.ignored) {
            return; // 멱등성 - 이미 처리됨
        }

        log.info("[PhaseEnd] Phase changed: roomCode={}, from={}, to={}, version={}",
                roomCode, requestedPhase, holder.newPhase, holder.newVersion);

        // 브로드캐스트
        broadcastPhaseChange(roomCode, holder);
    }

    private void broadcastPhaseChange(String roomCode, PhaseEndHolder holder) {
        // 1. PHASE_CHANGED 이벤트
        Map<String, Object> phasePayload = new HashMap<>();
        phasePayload.put("version", holder.newVersion);
        phasePayload.put("phase", holder.newPhase.name());
        phasePayload.put("phaseEndsAt", holder.phaseEndsAt);
        phasePayload.put("round", holder.round);

        gameMessagePort.sendToRoom(roomCode, "PHASE_CHANGED", phasePayload);

        // 2. Phase별 추가 이벤트
        PhaseTransitionResult tr = holder.transition;

        if (tr == null) return;

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

        // NIGHT 결과 (killedUserId가 있으면)
        if (tr.killedUserId() != null) {
            Map<String, Object> nightResult = new HashMap<>();
            nightResult.put("version", holder.newVersion);
            nightResult.put("killedUserId", tr.killedUserId().value());
            nightResult.put("saved", tr.saved());
            gameMessagePort.sendToRoom(roomCode, "NIGHT_RESULT", nightResult);
        }

        // 게임 종료
        if (tr.winner() != null) {
            Map<String, Object> gameFinished = new HashMap<>();
            gameFinished.put("version", holder.newVersion);
            gameFinished.put("winnerTeam", tr.winner().name());
            gameFinished.put("mvpUserId", null);
            gameMessagePort.sendToRoom(roomCode, "GAME_FINISHED", gameFinished);
        }
    }

    private static class PhaseEndHolder {
        boolean ignored = false;
        PhaseTransitionResult transition;
        long newVersion;
        Phase newPhase;
        String phaseEndsAt;
        int round;
    }
}
