package com.a407.sniffythedog.adapter.in.http.auth.response;

import com.a407.sniffythedog.application.auth.in.KakaoLoginResult;

public record KakaoLoginResponse(
    Long userId,
    String nickname,
    String socialProvider,
    boolean isNew
) {
    public static KakaoLoginResponse from(KakaoLoginResult result) {
        return new KakaoLoginResponse(
            result.userId(),
            result.nickname(),
            result.socialProvider(),
            result.isNew()
        );
    }
}
