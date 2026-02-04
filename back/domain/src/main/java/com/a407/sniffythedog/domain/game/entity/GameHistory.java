package com.a407.sniffythedog.domain.game.entity;

import com.a407.sniffythedog.domain.game.enums.Winner;
import com.a407.sniffythedog.domain.game.vo.GameHistoryId;

import java.time.Instant;
import java.util.Objects;

public class GameHistory {

    private final GameHistoryId id;
    private final String roomId;
    private final Winner winner;
    private final Instant startAt;
    private final Instant endAt;
    private final int playTime;

    private GameHistory(GameHistoryId id, String roomId, Winner winner, Instant startAt, Instant endAt, int playTime) {
        this.id = id;
        this.roomId = Objects.requireNonNull(roomId, "roomId must not be null");
        this.winner = Objects.requireNonNull(winner, "winner must not be null");
        this.startAt = Objects.requireNonNull(startAt, "startAt must not be null");
        this.endAt = Objects.requireNonNull(endAt, "endAt must not be null");
        this.playTime = playTime;
    }

    public static GameHistory create(String roomId, Winner winner, Instant startAt, Instant endAt, int playTime) {
        return new GameHistory(null, roomId, winner, startAt, endAt, playTime);
    }

    public static GameHistory reconstitute(GameHistoryId id, String roomId, Winner winner, Instant startAt, Instant endAt, int playTime) {
        return new GameHistory(id, roomId, winner, startAt, endAt, playTime);
    }

    public GameHistoryId getId() {
        return id;
    }

    public String getRoomId() {
        return roomId;
    }

    public Winner getWinner() {
        return winner;
    }

    public Instant getStartAt() {
        return startAt;
    }

    public Instant getEndAt() {
        return endAt;
    }

    public int getPlayTime() {
        return playTime;
    }
}