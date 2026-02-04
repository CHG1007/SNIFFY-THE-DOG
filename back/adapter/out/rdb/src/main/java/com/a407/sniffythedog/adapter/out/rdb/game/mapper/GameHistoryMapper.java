package com.a407.sniffythedog.adapter.out.rdb.game.mapper;

import com.a407.sniffythedog.adapter.out.rdb.game.entity.GameHistoryEntity;
import com.a407.sniffythedog.domain.game.entity.GameHistory;
import com.a407.sniffythedog.domain.game.vo.GameHistoryId;

public class GameHistoryMapper {

    private GameHistoryMapper() {
    }

    public static GameHistoryEntity toEntity(GameHistory domain) {
        return new GameHistoryEntity(
            domain.getId() != null ? domain.getId().value() : null,
            domain.getRoomId(),
            domain.getWinner(),
            domain.getStartAt(),
            domain.getEndAt(),
            domain.getPlayTime()
        );
    }

    public static GameHistory toDomain(GameHistoryEntity entity) {
        return GameHistory.reconstitute(
            GameHistoryId.of(entity.getId()),
            entity.getRoomId(),
            entity.getWinner(),
            entity.getStartAt(),
            entity.getEndAt(),
            entity.getPlayTime()
        );
    }
}
