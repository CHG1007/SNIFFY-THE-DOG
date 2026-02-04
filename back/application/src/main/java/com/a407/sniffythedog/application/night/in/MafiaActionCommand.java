package com.a407.sniffythedog.application.night.in;

public record MafiaActionCommand(
        String roomCode,
        Long userId,
        String requestId,
        Long targetUserId
) {}