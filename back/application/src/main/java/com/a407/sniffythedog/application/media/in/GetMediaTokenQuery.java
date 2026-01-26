package com.a407.sniffythedog.application.media.in;

public record GetMediaTokenQuery(
        String roomId,
        String userId
) {
}
