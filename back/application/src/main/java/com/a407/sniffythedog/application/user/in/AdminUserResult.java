package com.a407.sniffythedog.application.user.in;

import java.time.Instant;

public record AdminUserResult(
    Long userId,
    String nickname,
    String socialProvider,
    String role,
    String status,
    Instant createdAt,
    Instant updatedAt
) {
}