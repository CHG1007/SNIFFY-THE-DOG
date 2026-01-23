package com.a407.sniffythedog.application.auth.in;

public record SocialLoginResult(
    String accessToken,
    String refreshToken,
    boolean isFirstLogin,
    UserInfo user
) {
    public record UserInfo(
        Long userId,
        String nickname,
        String role,
        String status
    ) {
    }
}
