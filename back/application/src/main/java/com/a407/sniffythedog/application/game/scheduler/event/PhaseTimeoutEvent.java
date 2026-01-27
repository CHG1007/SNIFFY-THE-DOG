package com.a407.sniffythedog.application.game.scheduler.event;

public record PhaseTimeoutEvent(
        String roomCode,
        long version
) {
}
