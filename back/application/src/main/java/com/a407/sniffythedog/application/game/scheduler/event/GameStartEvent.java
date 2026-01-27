package com.a407.sniffythedog.application.game.scheduler.event;

public record GameStartEvent(
        String roomCode,
        long version) {
}
