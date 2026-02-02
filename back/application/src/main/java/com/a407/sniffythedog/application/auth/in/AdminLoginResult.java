package com.a407.sniffythedog.application.auth.in;

public record AdminLoginResult(
    String accessToken,
    String refreshToken
) {
}
