package com.a407.sniffythedog.domain.room.entity;

public record RoomPlayer(
        long userId,
        String displayName, // 닉네임
        boolean ready
) {
    public RoomPlayer {
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("닉네임이 비어 있습니다.");
        }
    }
}
