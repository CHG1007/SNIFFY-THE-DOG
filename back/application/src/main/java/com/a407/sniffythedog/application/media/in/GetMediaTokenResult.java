package com.a407.sniffythedog.application.media.in;

public record GetMediaTokenResult(
        String sessionId,
        String token
) {
}
