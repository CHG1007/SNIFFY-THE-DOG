package com.a407.sniffythedog.adapter.in.http.auth.request;

import com.a407.sniffythedog.application.auth.in.SocialLoginCommand;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record SocialLoginRequest(
    @JsonProperty("AccessToken")
    @NotBlank(message = "AccessToken is required")
    String accessToken
) {
    public SocialLoginCommand toCommand(String social) {
        return new SocialLoginCommand(social, accessToken);
    }
}
