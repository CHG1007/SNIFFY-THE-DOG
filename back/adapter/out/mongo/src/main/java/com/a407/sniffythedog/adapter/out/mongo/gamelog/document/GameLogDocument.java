package com.a407.sniffythedog.adapter.out.mongo.gamelog.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "game_logs")
public class GameLogDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private String roomId;

    private List<PlayerResultDoc> players;
    private List<GameEventDoc> events;
    private String winner;
    private Instant startedAt;
    private Instant endedAt;

    public GameLogDocument() {
    }

    public GameLogDocument(String id, String roomId, List<PlayerResultDoc> players,
                           List<GameEventDoc> events, String winner,
                           Instant startedAt, Instant endedAt) {
        this.id = id;
        this.roomId = roomId;
        this.players = players;
        this.events = events;
        this.winner = winner;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public List<PlayerResultDoc> getPlayers() {
        return players;
    }

    public void setPlayers(List<PlayerResultDoc> players) {
        this.players = players;
    }

    public List<GameEventDoc> getEvents() {
        return events;
    }

    public void setEvents(List<GameEventDoc> events) {
        this.events = events;
    }

    public String getWinner() {
        return winner;
    }

    public void setWinner(String winner) {
        this.winner = winner;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    public static class PlayerResultDoc {
        private Long odUserId;
        private String odNickname;
        private String role;
        private boolean survived;

        public PlayerResultDoc() {
        }

        public PlayerResultDoc(Long odUserId, String odNickname, String role, boolean survived) {
            this.odUserId = odUserId;
            this.odNickname = odNickname;
            this.role = role;
            this.survived = survived;
        }

        public Long getOdUserId() {
            return odUserId;
        }

        public void setOdUserId(Long odUserId) {
            this.odUserId = odUserId;
        }

        public String getOdNickname() {
            return odNickname;
        }

        public void setOdNickname(String odNickname) {
            this.odNickname = odNickname;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public boolean isSurvived() {
            return survived;
        }

        public void setSurvived(boolean survived) {
            this.survived = survived;
        }
    }

    public static class GameEventDoc {
        private String type;
        private int round;
        private Long actorUserId;
        private Long targetUserId;
        private Boolean voteResult;
        private Instant timestamp;

        public GameEventDoc() {
        }

        public GameEventDoc(String type, int round, Long actorUserId, Long targetUserId,
                            Boolean voteResult, Instant timestamp) {
            this.type = type;
            this.round = round;
            this.actorUserId = actorUserId;
            this.targetUserId = targetUserId;
            this.voteResult = voteResult;
            this.timestamp = timestamp;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public int getRound() {
            return round;
        }

        public void setRound(int round) {
            this.round = round;
        }

        public Long getActorUserId() {
            return actorUserId;
        }

        public void setActorUserId(Long actorUserId) {
            this.actorUserId = actorUserId;
        }

        public Long getTargetUserId() {
            return targetUserId;
        }

        public void setTargetUserId(Long targetUserId) {
            this.targetUserId = targetUserId;
        }

        public Boolean getVoteResult() {
            return voteResult;
        }

        public void setVoteResult(Boolean voteResult) {
            this.voteResult = voteResult;
        }

        public Instant getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(Instant timestamp) {
            this.timestamp = timestamp;
        }
    }
}
