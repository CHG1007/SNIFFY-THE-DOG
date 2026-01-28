package com.a407.sniffythedog.adapter.in.http.room.response;

import lombok.Builder;

import java.time.OffsetDateTime;

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
    public record Data(
            String winnerTeam,
            Long mvpUserId
    ) {}
}