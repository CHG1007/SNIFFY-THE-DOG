package com.a407.sniffythedog.application.port.in.room;

public record CreateRoomResult(
        String roomId,
        String inviteCode
) {
}
