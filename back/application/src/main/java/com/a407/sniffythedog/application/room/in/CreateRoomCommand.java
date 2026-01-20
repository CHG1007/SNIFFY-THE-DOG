package com.a407.sniffythedog.application.room.in;

public record CreateRoomCommand(
        String title,
        int capacity,
        boolean isPrivate,
        Long hostUserId,
        String hostDisplayName
) {
    public CreateRoomCommand {
        if (capacity < 6 || capacity > 8) {
            throw new IllegalArgumentException("인원은 6~8명 사이여야 합니다.");
        }
    }
}

