package com.a407.sniffythedog.adapter.in.http.global.security;

public record AuthenticatedUser(
    Long userId,
    String role
) {
}
