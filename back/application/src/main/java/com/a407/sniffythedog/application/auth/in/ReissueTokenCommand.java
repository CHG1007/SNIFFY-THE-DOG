package com.a407.sniffythedog.application.auth.in;

public record ReissueTokenCommand(
    Long userId,
    String refreshToken
) {
}
