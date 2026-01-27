package com.a407.sniffythedog.application.game.in;

import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.enums.RoomStatus;

import java.time.Instant;
import java.util.List;

public record RoomState(String roomCode,
                        RoomStatus status,
                        Long hostUserId,
                        Phase phase,
                        Instant phaseEndsAt,
                        long version,
                        List<PlayerSummary> players
) {
    public static RoomState from(RoomSession room) {
        return new RoomState(
                room.getId().toString(),
                room.getStatus(),
                room.getHostUserId().value(),
                room.getGameState().phase(),
                room.getGameState().phaseEndsAt(),
                room.getVersion(),
                room.getPlayers().values().stream()
                        .map(PlayerSummary::from)
                        .toList()
        );
    }
}