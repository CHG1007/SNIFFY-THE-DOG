package com.a407.sniffythedog.domain.auth;

import com.a407.sniffythedog.domain.user.vo.UserId;

import java.time.Instant;
import java.util.Objects;

public class RefreshToken {

    private final UserId userId;
    private final String token;
    private final Instant expiryDate;

    private RefreshToken(UserId userId, String token, Instant expiryDate) {
        this.userId = Objects.requireNonNull(userId);
        this.token = Objects.requireNonNull(token);
        this.expiryDate = Objects.requireNonNull(expiryDate);
    }

    public static RefreshToken create(UserId userId, String token, Instant expiryDate) {
        return new RefreshToken(userId, token, expiryDate);
    }

    public static RefreshToken reconstitute(UserId userId, String token, Instant expiryDate) {
        return new RefreshToken(userId, token, expiryDate);
    }

    public UserId getUserId() {
        return userId;
    }

    public String getToken() {
        return token;
    }

    public Instant getExpiryDate() {
        return expiryDate;
    }
}
