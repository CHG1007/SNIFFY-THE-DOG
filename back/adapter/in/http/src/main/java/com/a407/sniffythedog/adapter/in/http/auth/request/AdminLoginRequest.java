package com.a407.sniffythedog.adapter.in.http.auth.request;

import com.a407.sniffythedog.application.auth.in.AdminLoginCommand;
import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(
    @NotBlank(message = "id is required")
    String id,
    @NotBlank(message = "password is required")
    String password
) {
    public AdminLoginCommand toCommand() {
        return new AdminLoginCommand(id, password);
    }
}
