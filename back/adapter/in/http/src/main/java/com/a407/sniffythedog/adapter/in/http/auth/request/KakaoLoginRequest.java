package com.a407.sniffythedog.adapter.in.http.auth.request;

import com.a407.sniffythedog.application.auth.in.KakaoLoginCommand;
import jakarta.validation.constraints.NotBlank;

public record KakaoLoginRequest(
    @NotBlank(message = "token is required")
    String token,
    @NotBlank(message = "socialType is required")
    String socialType
) {
    public KakaoLoginCommand toCommand() {
        return new KakaoLoginCommand(token, socialType);
    }
}
