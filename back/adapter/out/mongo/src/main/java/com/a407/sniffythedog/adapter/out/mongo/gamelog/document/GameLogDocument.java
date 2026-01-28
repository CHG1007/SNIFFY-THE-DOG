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
    private String totalSummary;

    public GameLogDocument() {
    }

    public GameLogDocument(String id, String roomId, List<PlayerResultDoc> players,
                           List<GameEventDoc> events, String winner,
                           Instant startedAt, Instant endedAt, String totalSummary) {
        this.id = id;
        this.roomId = roomId;
        this.players = players;
        this.events = events;
        this.winner = winner;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.totalSummary = totalSummary;
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

    public String getTotalSummary() { return totalSummary; }

    public void setTotalSummary(String totalSummary) { this.totalSummary = totalSummary; }

    public static class PlayerResultDoc {
        private Long odUserId;
        private String odNickname;
        private String role;
        private boolean survived;
        private String aiReport;

        public PlayerResultDoc() {
        }

        public PlayerResultDoc(Long odUserId, String odNickname, String role, boolean survived, String aiReport) {
            this.odUserId = odUserId;
            this.odNickname = odNickname;
            this.role = role;
            this.survived = survived;
            this.aiReport = aiReport;
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

        public String getAiReport() { return aiReport; }

        public void setAiReport(String aiReport) { this.aiReport = aiReport; }
    }

    public static class GameEventDoc {
        private String type;
        private int round;
        private Long actorUserId;
        private Long targetUserId;
        private Boolean voteResult;
        private Boolean isMafia;
        private Instant timestamp;

        private Long mafiaTargetUserId;
        private Long doctorTargetUserId;
        private Long killedUserId;
        private Boolean saved;

        private String phase;
        private String winnerTeam;


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

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public int getRound() { return round; }
        public void setRound(int round) { this.round = round; }

        public Long getActorUserId() { return actorUserId; }
        public void setActorUserId(Long actorUserId) { this.actorUserId = actorUserId; }

        public Long getTargetUserId() { return targetUserId; }
        public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

        public Boolean getVoteResult() { return voteResult; }
        public void setVoteResult(Boolean voteResult) { this.voteResult = voteResult; }

        public Boolean getIsMafia() { return isMafia; }
        public void setIsMafia(Boolean isMafia) { this.isMafia = isMafia; }


        public Long getMafiaTargetUserId() { return mafiaTargetUserId; }
        public void setMafiaTargetUserId(Long mafiaTargetUserId) { this.mafiaTargetUserId = mafiaTargetUserId; }

        public Long getDoctorTargetUserId() { return doctorTargetUserId; }
        public void setDoctorTargetUserId(Long doctorTargetUserId) { this.doctorTargetUserId = doctorTargetUserId; }

        public Long getKilledUserId() { return killedUserId; }
        public void setKilledUserId(Long killedUserId) { this.killedUserId = killedUserId; }

        public Boolean getSaved() { return saved; }
        public void setSaved(Boolean saved) { this.saved = saved; }

        public String getPhase() { return phase; }
        public void setPhase(String phase) { this.phase = phase; }

        public String getWinnerTeam() { return winnerTeam; }
        public void setWinnerTeam(String winnerTeam) { this.winnerTeam = winnerTeam; }

        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }
}
