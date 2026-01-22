package com.a407.sniffythedog.application.room.in;

public record GetPublicRoomResult(
        String roomId,
        String title,
        int currentCount,
        int capacity,
        boolean isPrivate
) {
}
