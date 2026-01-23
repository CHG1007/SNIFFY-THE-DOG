package com.a407.sniffythedog.application.auth.in;

public record ReissueTokenResult(
    String accessToken,
    String refreshToken
) {
}
