package com.a407.sniffythedog.domain.game.entity;

import com.a407.sniffythedog.domain.game.enums.GameResult;
import com.a407.sniffythedog.domain.game.enums.GameRole;
import com.a407.sniffythedog.domain.game.vo.GameHistoryId;
import com.a407.sniffythedog.domain.game.vo.ParticipantId;
import com.a407.sniffythedog.domain.user.vo.UserId;

import java.util.Objects;

public class Participant {

    private final ParticipantId id;
    private final UserId userId;
    private final GameHistoryId gameId;
    private final GameRole job;
    private final GameResult result;
    private final boolean isAlive;

    private Participant(ParticipantId id, UserId userId, GameHistoryId gameId,
                        GameRole job, GameResult result, boolean isAlive) {
        this.id = id;
        this.userId = Objects.requireNonNull(userId, "userId must not be null");
        this.gameId = Objects.requireNonNull(gameId, "gameId must not be null");
        this.job = Objects.requireNonNull(job, "job must not be null");
        this.result = Objects.requireNonNull(result, "result must not be null");
        this.isAlive = isAlive;
    }

    public static Participant reconstitute(ParticipantId id, UserId userId, GameHistoryId gameId,
                                           GameRole job, GameResult result, boolean isAlive) {
        return new Participant(id, userId, gameId, job, result, isAlive);
    }

    public static Participant create(UserId userId, GameHistoryId gameId, GameRole job, GameResult result, boolean isAlive) {
        return new Participant(null, userId, gameId, job, result, isAlive);
    }

    public ParticipantId getId() {
        return id;
    }

    public UserId getUserId() {
        return userId;
    }

    public GameHistoryId getGameId() {
        return gameId;
    }

    public GameRole getJob() {
        return job;
    }

    public GameResult getResult() {
        return result;
    }

    public boolean isAlive() {
        return isAlive;
    }

    public boolean isWin() {
        return result == GameResult.WIN;
    }
}