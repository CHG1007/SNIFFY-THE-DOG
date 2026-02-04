package com.a407.sniffythedog.application.game.in;

import com.a407.sniffythedog.domain.game.entity.RoomSession;

import java.time.Instant;
import java.util.List;

public record RoomState(
        String roomCode,
        String title,
        int capacity,
        String status,
        Long hostUserId,
        String phase,
        Instant phaseEndsAt,
        long version,
        List<PlayerSummary> players) {
    public static RoomState from(RoomSession room) {
        return new RoomState(
                room.getId().toString(),
                room.getTitle().value(),
                room.getCapacity(),
                room.getStatus().name(),
                room.getHostUserId().value(),
                room.getGameState().phase().name(),
                room.getGameState().phaseEndsAt(),
                room.getVersion(),
                room.getPlayers().values().stream()
                        .map(PlayerSummary::from)
                        .toList());
    }
}