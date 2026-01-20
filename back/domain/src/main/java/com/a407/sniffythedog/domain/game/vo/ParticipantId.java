package com.a407.sniffythedog.domain.game.vo;

import java.util.Objects;

public record ParticipantId(Long value) {

    public ParticipantId {
        Objects.requireNonNull(value, "ParticipantId value must not be null");
    }

    public static ParticipantId of(Long value) {
        return new ParticipantId(value);
    }
}
