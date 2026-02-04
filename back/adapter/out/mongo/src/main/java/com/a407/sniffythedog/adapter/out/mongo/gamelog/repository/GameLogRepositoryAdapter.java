package com.a407.sniffythedog.adapter.out.mongo.gamelog.repository;

import com.a407.sniffythedog.adapter.out.mongo.gamelog.document.GameLogDocument;
import com.a407.sniffythedog.adapter.out.mongo.gamelog.mapper.GameLogMapper;
import com.a407.sniffythedog.application.gamelog.out.GameLogPort;
import com.a407.sniffythedog.domain.gamelog.entity.GameLog;
import com.a407.sniffythedog.domain.gamelog.vo.GameLogId;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class GameLogRepositoryAdapter implements GameLogPort {

    private final GameLogMongoRepository mongoRepository;

    public GameLogRepositoryAdapter(GameLogMongoRepository mongoRepository) {
        this.mongoRepository = mongoRepository;
    }

    @Override
    public GameLog save(GameLog gameLog) {
        GameLogDocument document = GameLogMapper.toDocument(gameLog);
        GameLogDocument saved = mongoRepository.save(document);
        gameLog.assignId(GameLogId.of(saved.getId()));
        return gameLog;
    }

    @Override
    public Optional<GameLog> findById(GameLogId id) {
        return mongoRepository.findById(id.value())
                .map(GameLogMapper::toDomain);
    }

    @Override
    public Optional<GameLog> findByGameHistoryId(Long gameHistoryId) {
        return mongoRepository.findByGameHistoryId(gameHistoryId)
                .map(GameLogMapper::toDomain);
    }
}
