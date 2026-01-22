package com.a407.sniffythedog.domain.game.vo;

import java.util.Objects;

public record RoomId(String value) {

    public RoomId {
        Objects.requireNonNull(value, "RoomId value must not be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("RoomId value must not be blank");
        }
    }

    public static RoomId of(String value) {
        return new RoomId(value);
    }
}