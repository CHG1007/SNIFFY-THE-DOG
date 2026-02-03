package com.a407.sniffythedog.application.room.out;

import com.a407.sniffythedog.domain.game.entity.RoomSession;

import java.util.List;

public record RoomPage(
    List<RoomSession> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
}
