package com.a407.sniffythedog.domain.gamelog.vo;

import java.util.Objects;

public record GameLogId(String value) {

    public GameLogId {
        Objects.requireNonNull(value, "GameLogId must not be null");
    }

    public static GameLogId of(String value) {
        return new GameLogId(value);
    }
}
