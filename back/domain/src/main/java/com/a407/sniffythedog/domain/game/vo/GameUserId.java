package com.a407.sniffythedog.domain.game.vo;

import java.util.Objects;

public record GameUserId(Long value) {

    public GameUserId {
        Objects.requireNonNull(value, "GameUserId value must not be null");
    }

    public static GameUserId of(Long value) {
        return new GameUserId(value);
    }

    public String toString() {
        return String.valueOf(value);
    }
}