package com.a407.sniffythedog.domain.gamelog.vo;

import com.a407.sniffythedog.domain.gamelog.enums.GameEventType;

import java.time.Instant;
import java.util.Objects;

public record GameEvent(
        GameEventType type,
        int round,
        Long actorUserId,
        Long targetUserId,
        Boolean voteResult,
        Instant timestamp
) {

    public GameEvent {
        Objects.requireNonNull(type, "type must not be null");
        if (round < 1) {
            throw new IllegalArgumentException("round must be at least 1");
        }
        Objects.requireNonNull(timestamp, "timestamp must not be null");
    }

    public static GameEvent dayVote(int round, Long voterUserId, Long targetUserId) {
        return new GameEvent(GameEventType.DAY_VOTE, round, voterUserId, targetUserId, null, Instant.now());
    }

    public static GameEvent finalVote(int round, Long voterUserId, boolean approve) {
        return new GameEvent(GameEventType.FINAL_VOTE, round, voterUserId, null, approve, Instant.now());
    }

    public static GameEvent mafiaTarget(int round, Long targetUserId) {
        return new GameEvent(GameEventType.MAFIA_TARGET, round, null, targetUserId, null, Instant.now());
    }

    public static GameEvent doctorSave(int round, Long doctorUserId, Long targetUserId) {
        return new GameEvent(GameEventType.DOCTOR_SAVE, round, doctorUserId, targetUserId, null, Instant.now());
    }

    public static GameEvent policeCheck(int round, Long policeUserId, Long targetUserId) {
        return new GameEvent(GameEventType.POLICE_CHECK, round, policeUserId, targetUserId, null, Instant.now());
    }

    public static GameEvent kill(int round, Long killedUserId) {
        return new GameEvent(GameEventType.KILL, round, null, killedUserId, null, Instant.now());
    }

    public static GameEvent execute(int round, Long executedUserId) {
        return new GameEvent(GameEventType.EXECUTE, round, null, executedUserId, null, Instant.now());
    }
}
