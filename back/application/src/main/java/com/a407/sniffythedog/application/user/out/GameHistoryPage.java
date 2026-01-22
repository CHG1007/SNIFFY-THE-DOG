package com.a407.sniffythedog.application.user.out;

import com.a407.sniffythedog.domain.game.entity.GameHistory;
import com.a407.sniffythedog.domain.game.entity.Participant;

import java.util.List;

public record GameHistoryPage(
    List<GameHistoryWithParticipant> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public record GameHistoryWithParticipant(
        GameHistory gameHistory,
        Participant participant
    ) {}

    public boolean hasNext() {
        return page < totalPages - 1;
    }

    public boolean hasPrevious() {
        return page > 0;
    }
}