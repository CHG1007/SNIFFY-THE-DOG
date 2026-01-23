package com.a407.sniffythedog.adapter.in.http.auth.response;

import com.a407.sniffythedog.application.auth.in.SocialLoginResult;

public record SocialLoginResponse(
    String accessToken,
    String refreshToken,
    boolean isFirstLogin,
    UserResponse user
) {
    public static SocialLoginResponse from(SocialLoginResult result) {
        SocialLoginResult.UserInfo userInfo = result.user();
        return new SocialLoginResponse(
            result.accessToken(),
            result.refreshToken(),
            result.isFirstLogin(),
            new UserResponse(
                userInfo.userId(),
                userInfo.nickname(),
                userInfo.role(),
                userInfo.status()
            )
        );
    }

    public record UserResponse(
        Long userId,
        String nickname,
        String role,
        String status
    ) {
    }
}
