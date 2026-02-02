package com.a407.sniffythedog.adapter.in.http.auth.response;

import com.a407.sniffythedog.application.auth.in.AdminLoginResult;

public record AdminLoginResponse(
    String accessToken,
    String refreshToken
) {
    public static AdminLoginResponse from(AdminLoginResult result) {
        return new AdminLoginResponse(result.accessToken(), result.refreshToken());
    }
}
