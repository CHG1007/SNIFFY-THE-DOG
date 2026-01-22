package com.a407.sniffythedog.domain.user.vo;

import java.util.Objects;
import java.util.regex.Pattern;

public record Nickname(String value) {

    private static final int MIN_LENGTH = 1;
    private static final int MAX_LENGTH = 20;
    private static final Pattern VALID_PATTERN = Pattern.compile("^[가-힣a-zA-Z0-9]+$");

    public Nickname {
        Objects.requireNonNull(value, "Nickname value must not be null");
        if (value.length() < MIN_LENGTH || value.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    String.format("Nickname must be between %d and %d characters", MIN_LENGTH, MAX_LENGTH));
        }
        if (!VALID_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("Nickname must contain only Korean, English, or numbers");
        }
    }

    public static Nickname of(String value) {
        return new Nickname(value);
    }
}
