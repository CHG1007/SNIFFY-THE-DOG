package com.a407.sniffythedog.domain.game.vo;

import java.util.Objects;

public record RoomTitle(String value) {

    private static final int MAX_LENGTH = 50;

    public RoomTitle {
        Objects.requireNonNull(value, "RoomTitle value must not be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("RoomTitle value must not be blank");
        }
        if (value.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("RoomTitle must not exceed " + MAX_LENGTH + " characters");
        }
    }

    public static RoomTitle of(String value) {
        return new RoomTitle(value);
    }
}