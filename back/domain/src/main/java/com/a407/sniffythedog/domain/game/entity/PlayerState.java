package com.a407.sniffythedog.domain.game.entity;

import com.a407.sniffythedog.domain.game.enums.GameRole;
import com.a407.sniffythedog.domain.game.vo.GameUserId;

import java.time.Instant;
import java.util.Objects;

public class PlayerState {

    private final GameUserId userId;
    private final String displayName;
    private final boolean isHost;
    private final Instant joinedAt;
    private boolean ready;
    private boolean alive;
    private GameRole gameRole;
    private int remainingChances;

    private PlayerState(GameUserId userId, String displayName, boolean isHost, Instant joinedAt,
                        boolean ready, boolean alive, GameRole gameRole, int remainingChances) {
        this.userId = Objects.requireNonNull(userId);
        this.displayName = Objects.requireNonNull(displayName);
        this.isHost = isHost;
        this.joinedAt = Objects.requireNonNull(joinedAt);
        this.ready = ready;
        this.alive = alive;
        this.gameRole = gameRole;
        this.remainingChances = remainingChances;
    }

    public static PlayerState createNew(GameUserId userId, String displayName, boolean isHost) {
        return new PlayerState(userId, displayName, isHost, Instant.now(), false, true, null, 0);
    }

    public static PlayerState reconstitute(GameUserId userId, String displayName, boolean isHost, Instant joinedAt,
                                           boolean ready, boolean alive, GameRole gameRole, int remainingChances) {
        return new PlayerState(userId, displayName, isHost, joinedAt, ready, alive, gameRole, remainingChances);
    }

    public void toggleReady() {
        this.ready = !this.ready;
    }

    public void setReady(boolean ready) {
        this.ready = ready;
    }

    public void assignRole(GameRole role) {
        this.gameRole = role;
        // 시민에게만 AI 찬스 2회 지급
        if (role == GameRole.CITIZEN) {
            this.remainingChances = 2;
        } else {
            this.remainingChances = 0;
        }
    }

    public void kill() {
        this.alive = false;
    }

    public void revive() {
        this.alive = true;
    }

    public boolean useChance() {
        if (remainingChances <= 0) {
            return false;
        }
        remainingChances--;
        return true;
    }

    public boolean isMafia() {
        return gameRole == GameRole.MAFIA;
    }

    public boolean isCitizen() {
        return gameRole == GameRole.CITIZEN;
    }

    public boolean isPolice() {
        return gameRole == GameRole.POLICE;
    }

    public boolean isDoctor() {
        return gameRole == GameRole.DOCTOR;
    }

    public boolean isCitizenTeam() {
        return gameRole != GameRole.MAFIA;
    }

    // Getters
    public GameUserId getUserId() {
        return userId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isHost() {
        return isHost;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public boolean isReady() {
        return ready;
    }

    public boolean isAlive() {
        return alive;
    }

    public GameRole getGameRole() {
        return gameRole;
    }

    public int getRemainingChances() {
        return remainingChances;
    }
}
