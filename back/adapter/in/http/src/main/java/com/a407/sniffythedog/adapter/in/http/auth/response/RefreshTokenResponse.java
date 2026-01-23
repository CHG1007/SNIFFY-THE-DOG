package com.a407.sniffythedog.adapter.in.http.auth.response;

import com.a407.sniffythedog.application.auth.in.ReissueTokenResult;

public record RefreshTokenResponse(
    String accessToken,
    String refreshToken
) {
    public static RefreshTokenResponse from(ReissueTokenResult result) {
        return new RefreshTokenResponse(result.accessToken(), result.refreshToken());
    }
}
