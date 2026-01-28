package com.a407.sniffythedog.domain.gamelog.vo;

import com.a407.sniffythedog.domain.gamelog.enums.GameEventType;
import com.a407.sniffythedog.domain.game.enums.Phase;

import java.time.Instant;
import java.util.Objects;

public record GameEvent(
        GameEventType type,
        int round,

        Long actorUserId,
        Long targetUserId,

        Boolean voteResult,
        Boolean isMafia,

        Long mafiaTargetUserId,   // NIGHT_RESOLVE에서 기록
        Long doctorTargetUserId,  // NIGHT_RESOLVE에서 기록
        Long killedUserId,        // NIGHT_RESOLVE / KILL에서 기록
        Boolean saved,            // NIGHT_RESOLVE에서 기록(의사가 막았는지)

        Phase phase,              // PHASE_CHANGED에서 기록
        String winnerTeam,        // GAME_FINISHED에서 기록

        Instant timestamp

) {

    public GameEvent {
        Objects.requireNonNull(type, "type must not be null");
        if (round < 1) throw new IllegalArgumentException("round must be at least 1");
        Objects.requireNonNull(timestamp, "timestamp must not be null");
    }

    public GameEvent(
            GameEventType type,
            int round,
            Long actorUserId,
            Long targetUserId,
            Boolean voteResult,
            Instant timestamp
    ) {
        this(type, round,
                actorUserId, targetUserId,
                voteResult,
                null,
                null, null, null, null,
                null, null,
                timestamp);
    }


    public static GameEvent dayVote(int round, Long voterUserId, Long targetUserId) {
        return new GameEvent(GameEventType.DAY_VOTE, round, voterUserId, targetUserId, null,
                null,null, null, null, null,
                null, null,
                Instant.now());
    }

    public static GameEvent finalVote(int round, Long voterUserId, boolean approve) {
        return new GameEvent(GameEventType.FINAL_VOTE, round, voterUserId, null, approve,
                null,null, null, null, null,
                null, null,
                Instant.now());
    }

    public static GameEvent mafiaTarget(int round, Long targetUserId) {
        return new GameEvent(GameEventType.MAFIA_TARGET, round, null, targetUserId, null,
                null,null, null, null, null,
                null, null,
                Instant.now());
    }

    public static GameEvent doctorSave(int round, Long doctorUserId, Long targetUserId) {
        return new GameEvent(GameEventType.DOCTOR_SAVE, round, doctorUserId, targetUserId, null,
                null,null, null, null, null,
                null, null,
                Instant.now());
    }

    public static GameEvent policeCheck(int round, Long policeUserId, Long targetUserId, boolean isMafia) {
        return new GameEvent(GameEventType.POLICE_CHECK, round, policeUserId,
                targetUserId, null, isMafia, null, null, null, null, null, null,
                Instant.now()
        );
    }


    public static GameEvent kill(int round, Long killedUserId) {
        return new GameEvent(GameEventType.KILL, round, null, killedUserId, null,
                null,null, null, killedUserId, null,
                null, null,
                Instant.now());
    }

    public static GameEvent execute(int round, Long executedUserId) {
        return new GameEvent(GameEventType.EXECUTE, round, null, executedUserId, null,
                null,null, null, executedUserId, null,
                null, null,
                Instant.now());
    }


    public static GameEvent nightResolve(int round,
                                         Long mafiaTargetUserId,
                                         Long doctorTargetUserId,
                                         Long killedUserId,
                                         boolean saved) {
        return new GameEvent(GameEventType.NIGHT_RESOLVE, round, null, null, null,
                null,mafiaTargetUserId, doctorTargetUserId, killedUserId, saved,
                null,null,
                Instant.now());
    }

    public static GameEvent phaseChanged(int round, Phase phase) {
        return new GameEvent(GameEventType.PHASE_CHANGED, round, null, null, null
                ,null,null, null, null, null,
                phase, null,
                Instant.now());
    }

    public static GameEvent gameFinished(int round, String winnerTeam) {
        return new GameEvent(GameEventType.GAME_FINISHED, round, null, null, null
                ,null,null, null, null, null,
                null, winnerTeam,
                Instant.now());
    }
}
