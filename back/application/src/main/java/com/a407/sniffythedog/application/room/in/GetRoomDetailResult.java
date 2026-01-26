package com.a407.sniffythedog.application.room.in;

import com.a407.sniffythedog.domain.game.enums.RoomStatus;

import java.util.List;

public record GetRoomDetailResult(
        String roomId,
        String title,
        boolean isPrivate,
        int capacity,
        RoomStatus status,
        long hostUserId,
        List<PlayerItem> players
) {
    public record PlayerItem(long userId, String displayName, boolean ready) {}
}
