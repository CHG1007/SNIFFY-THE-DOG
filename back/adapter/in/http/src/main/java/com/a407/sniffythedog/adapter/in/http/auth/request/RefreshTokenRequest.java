package com.a407.sniffythedog.adapter.in.http.auth.request;

import com.a407.sniffythedog.application.auth.in.ReissueTokenCommand;
import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
    @NotBlank(message = "refreshToken is required")
    String refreshToken
) {
    public ReissueTokenCommand toCommand() {
        return new ReissueTokenCommand(refreshToken);
    }
}
