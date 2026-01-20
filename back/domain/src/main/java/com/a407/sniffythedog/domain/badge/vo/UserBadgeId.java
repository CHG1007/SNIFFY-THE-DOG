package com.a407.sniffythedog.domain.badge.vo;

import java.util.Objects;

public record UserBadgeId(Long value) {

    public UserBadgeId {
        Objects.requireNonNull(value, "UserBadgeId value must not be null");
    }

    public static UserBadgeId of(Long value) {
        return new UserBadgeId(value);
    }
}
