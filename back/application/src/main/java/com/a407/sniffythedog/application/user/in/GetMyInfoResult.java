package com.a407.sniffythedog.application.user.in;

import java.time.Instant;

public record GetMyInfoResult(
    Long userId,
    String nickname,
    String socialProvider,
    String role,
    String status,
    Instant createdAt
) {
}
