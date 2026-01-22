package com.a407.sniffythedog.adapter.out.rdb.game.mapper;

import com.a407.sniffythedog.adapter.out.rdb.game.entity.GameHistoryEntity;
import com.a407.sniffythedog.domain.game.entity.GameHistory;
import com.a407.sniffythedog.domain.game.vo.GameHistoryId;

public class GameHistoryMapper {

    private GameHistoryMapper() {
    }

    public static GameHistory toDomain(GameHistoryEntity entity) {
        return GameHistory.reconstitute(
            GameHistoryId.of(entity.getId()),
            entity.getWinner(),
            entity.getStartAt(),
            entity.getEndAt(),
            entity.getPlayTime()
        );
    }
}
