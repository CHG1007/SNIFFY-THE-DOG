package com.a407.sniffythedog.room.entity;

import com.a407.sniffythedog.domain.game.enums.GameRole;

import java.time.Instant;

public record RedisPlayerState(
        Long userId,
        String displayName,
        boolean isHost,
        Instant joinedAt,
        boolean isReady,
        boolean isAlive,
        GameRole role,
        int remainingChances
) {
}