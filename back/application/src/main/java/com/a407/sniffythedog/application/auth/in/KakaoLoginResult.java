package com.a407.sniffythedog.application.auth.in;

public record KakaoLoginResult(
    Long userId,
    String nickname,
    String socialProvider,
    boolean isNew
) {
}
