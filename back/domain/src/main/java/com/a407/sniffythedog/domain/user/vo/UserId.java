package com.a407.sniffythedog.domain.user.vo;

import java.util.Objects;

public record UserId(Long value) {

    public UserId {
        Objects.requireNonNull(value, "UserId value must not be null");
    }

    public static UserId of(Long value) {
        return new UserId(value);
    }
}
