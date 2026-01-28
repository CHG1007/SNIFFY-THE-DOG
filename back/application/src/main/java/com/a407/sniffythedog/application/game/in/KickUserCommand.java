package com.a407.sniffythedog.application.game.in;

public record KickUserCommand(
        String roomCode,
        Long hostUserId,
        Long targetUserId,
        String requestId
) {
}
