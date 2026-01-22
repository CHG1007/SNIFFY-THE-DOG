package com.a407.sniffythedog.room.entity;

import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.enums.RoomStatus;
import com.a407.sniffythedog.domain.game.vo.GameState;
import com.a407.sniffythedog.domain.game.vo.GameUserId;

import java.time.Instant;
import java.util.Map;

public record RedisRoomJson(
        String id,
        String title,
        boolean isPrivate,
        String inviteCode,
        int capacity,
        Long hostUserId,
        RoomStatus status,
        long version,
        Instant createdAt,
        Instant updatedAt,
        Instant startedAt,
        Instant endedAt,
        Map<GameUserId, PlayerState> players,
        GameState gameState
) {
}
