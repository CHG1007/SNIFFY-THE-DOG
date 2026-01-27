package com.a407.sniffythedog.domain.gamelog.entity;

import com.a407.sniffythedog.domain.game.enums.Winner;
import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import com.a407.sniffythedog.domain.gamelog.vo.GameLogId;
import com.a407.sniffythedog.domain.gamelog.vo.PlayerResult;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class GameLog {

    private GameLogId id;
    private final String roomId;
    private final List<PlayerResult> players;
    private final List<GameEvent> events;
    private Winner winner;
    private final Instant startedAt;
    private Instant endedAt;

    private GameLog(GameLogId id, String roomId, List<PlayerResult> players,
                    List<GameEvent> events, Winner winner, Instant startedAt, Instant endedAt) {
        this.id = id;
        this.roomId = Objects.requireNonNull(roomId, "roomId must not be null");
        this.players = new ArrayList<>(players);
        this.events = new ArrayList<>(events);
        this.winner = winner;
        this.startedAt = Objects.requireNonNull(startedAt, "startedAt must not be null");
        this.endedAt = endedAt;
    }

    public static GameLog create(String roomId, List<PlayerResult> players, Instant startedAt) {
        return new GameLog(null, roomId, players, new ArrayList<>(), null, startedAt, null);
    }

    public static GameLog reconstitute(GameLogId id, String roomId, List<PlayerResult> players,
                                        List<GameEvent> events, Winner winner,
                                        Instant startedAt, Instant endedAt) {
        return new GameLog(id, roomId, players, events, winner, startedAt, endedAt);
    }

    public void addEvent(GameEvent event) {
        this.events.add(event);
    }

    public void finish(Winner winner, List<PlayerResult> finalPlayers) {
        this.winner = winner;
        this.endedAt = Instant.now();
        this.players.clear();
        this.players.addAll(finalPlayers);
    }

    public void assignId(GameLogId id) {
        this.id = id;
    }

    public GameLogId getId() {
        return id;
    }

    public String getRoomId() {
        return roomId;
    }

    public List<PlayerResult> getPlayers() {
        return Collections.unmodifiableList(players);
    }

    public List<GameEvent> getEvents() {
        return Collections.unmodifiableList(events);
    }

    public Winner getWinner() {
        return winner;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }
}
