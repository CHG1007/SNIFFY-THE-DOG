package com.a407.sniffythedog.application.user.in;

import com.a407.sniffythedog.application.common.PageInfo;

import java.time.Instant;
import java.util.List;

public record GetUserGameHistoryResult(
    List<GameHistoryItem> games,
    PageInfo pageInfo
) {
    public record GameHistoryItem(
        Long gameId,
        String job,
        String result,
        String winner,
        boolean isAlive,
        Instant startAt,
        Instant endAt,
        int playTime
    ) {}
}
