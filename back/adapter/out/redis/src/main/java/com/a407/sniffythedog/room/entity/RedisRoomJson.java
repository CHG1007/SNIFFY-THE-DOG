package com.a407.sniffythedog.room.entity;

import com.a407.sniffythedog.domain.game.enums.RoomStatus;
import com.a407.sniffythedog.domain.game.vo.GameState;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Map;

public record RedisRoomJson(
        String id,
        String title,
        //[핵심 수정] JSON 필드명을 "isPrivate"으로 고정하여 매핑 오류 방지
        @JsonProperty("isPrivate")
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
        Map<String, RedisPlayerState> players,
        GameState gameState
) {
}
