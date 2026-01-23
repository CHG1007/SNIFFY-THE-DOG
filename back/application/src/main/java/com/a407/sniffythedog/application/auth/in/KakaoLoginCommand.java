package com.a407.sniffythedog.application.auth.in;

public record KakaoLoginCommand(
    String token,
    String socialType
) {
}
