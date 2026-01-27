package com.a407.sniffythedog.application.auth.out;

import java.time.Instant;

public record IssuedToken(
    String token,
    Instant expiresAt
) {
}
