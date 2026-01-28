package com.a407.sniffythedog.log.entity;

import com.a407.sniffythedog.domain.gamelog.vo.PlayerResult;

import java.time.Instant;
import java.util.List;

public record RedisGameLogMetaJson(
        String roomId,
        List<PlayerResult> players,
        Instant startedAt
) {
}
