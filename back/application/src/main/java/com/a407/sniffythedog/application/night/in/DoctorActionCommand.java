package com.a407.sniffythedog.application.night.in;

public record DoctorActionCommand(
        String roomCode,
        Long userId,
        String requestId,
        Long targetUserId
) {}
