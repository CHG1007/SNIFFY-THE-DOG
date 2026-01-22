package com.a407.sniffythedog.domain.game.vo;

import java.util.Objects;

public record GameHistoryId(Long value) {

    public GameHistoryId {
        Objects.requireNonNull(value, "GameHistoryId value must not be null");
    }

    public static GameHistoryId of(Long value) {
        return new GameHistoryId(value);
    }
}
