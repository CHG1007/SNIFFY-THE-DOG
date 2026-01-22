package com.a407.sniffythedog.domain.user.vo;

import java.util.Objects;

public record SocialUuid(String value) {

    public SocialUuid {
        Objects.requireNonNull(value, "SocialUuid value must not be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("SocialUuid value must not be blank");
        }
        if (value.length() > 255) {
            throw new IllegalArgumentException("SocialUuid value must not exceed 255 characters");
        }
    }

    public static SocialUuid of(String value) {
        return new SocialUuid(value);
    }
}
