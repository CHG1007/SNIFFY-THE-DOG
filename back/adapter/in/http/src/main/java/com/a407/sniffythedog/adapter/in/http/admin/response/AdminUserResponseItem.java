package com.a407.sniffythedog.adapter.in.http.admin.response;

import java.time.Instant;

public record AdminUserResponseItem(
    Long userId,
    String nickname,
    String socialProvider,
    String role,
    String status,
    Instant createdAt,
    Instant updatedAt
) {
}
