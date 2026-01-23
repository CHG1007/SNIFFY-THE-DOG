package com.a407.sniffythedog.application.auth.in;

public record SocialLoginCommand(
    String social,
    String accessToken
) {
}
