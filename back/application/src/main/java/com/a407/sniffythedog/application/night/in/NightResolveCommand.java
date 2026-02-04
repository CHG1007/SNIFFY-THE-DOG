package com.a407.sniffythedog.application.night.in;

public record NightResolveCommand(
        String roomCode,
        Long userId,
        String requestId
) {}