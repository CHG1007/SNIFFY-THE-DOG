package com.a407.sniffythedog.adapter.in.common.room.message;

public record PlayerStatusChangedMessage(
        String type,
        long version,
        Long userId,
        boolean isAlive,
        String reason
) {}
