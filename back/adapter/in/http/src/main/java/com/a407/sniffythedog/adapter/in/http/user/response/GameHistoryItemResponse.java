package com.a407.sniffythedog.adapter.in.http.user.response;

import com.a407.sniffythedog.application.user.in.GetUserGameHistoryResult;

import java.time.Instant;

public record GameHistoryItemResponse(
    Long gameId,
    String job,
    String result,
    String winner,
    boolean isAlive,
    Instant startAt,
    Instant endAt,
    int playTime
) {
    public static GameHistoryItemResponse from(GetUserGameHistoryResult.GameHistoryItem item) {
        return new GameHistoryItemResponse(
            item.gameId(),
            item.job(),
            item.result(),
            item.winner(),
            item.isAlive(),
            item.startAt(),
            item.endAt(),
            item.playTime()
        );
    }
}
