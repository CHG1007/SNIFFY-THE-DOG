package com.a407.sniffythedog.adapter.out.rdb.game.repository;

import com.a407.sniffythedog.adapter.out.rdb.game.entity.GameHistoryEntity;
import com.a407.sniffythedog.adapter.out.rdb.game.mapper.GameHistoryMapper;
import com.a407.sniffythedog.application.gamelog.out.GameHistorySavePort;
import com.a407.sniffythedog.domain.game.entity.GameHistory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class GameHistorySaveAdapter implements GameHistorySavePort {

    private final GameHistoryJpaRepository jpaRepository;

    @Override
    public GameHistory save(GameHistory gameHistory) {
        GameHistoryEntity entity = GameHistoryMapper.toEntity(gameHistory);
        GameHistoryEntity saved = jpaRepository.save(entity);
        return GameHistoryMapper.toDomain(saved);
    }
}
