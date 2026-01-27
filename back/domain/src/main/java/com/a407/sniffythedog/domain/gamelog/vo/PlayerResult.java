package com.a407.sniffythedog.domain.gamelog.vo;

import com.a407.sniffythedog.domain.game.enums.GameRole;

import java.util.Objects;

public record PlayerResult(
        Long odUserId,
        String odNickname,
        GameRole role,
        boolean survived
) {

    public PlayerResult {
        Objects.requireNonNull(odUserId, "odUserId must not be null");
        Objects.requireNonNull(odNickname, "odNickname must not be null");
        Objects.requireNonNull(role, "role must not be null");
    }

    public static PlayerResult of(Long odUserId, String odNickname, GameRole role, boolean survived) {
        return new PlayerResult(odUserId, odNickname, role, survived);
    }
}