package com.a407.sniffythedog.application.gamelog.out;

import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import com.a407.sniffythedog.domain.gamelog.vo.PlayerResult;

import java.time.Instant;
import java.util.List;

public record TempGameLogData(
    List<PlayerResult> players,
    List<GameEvent> events,
    Instant startedAt
) {
}
