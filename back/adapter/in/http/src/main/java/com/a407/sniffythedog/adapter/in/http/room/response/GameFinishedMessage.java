package com.a407.sniffythedog.adapter.in.http.room.response;

import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;

@Builder
public record GameFinishedMessage(
        String type,
        String roomCode,
        long version,
        OffsetDateTime timestamp,
        Data data
)
{
    @Builder
    public record PlayerRoleInfo(
            Long userId,
            String nickname,
            String role
    ) {}

    @Builder
    public record Data(
            String winnerTeam,
            Long mvpUserId,
            List<PlayerRoleInfo> players
    ) {}
}