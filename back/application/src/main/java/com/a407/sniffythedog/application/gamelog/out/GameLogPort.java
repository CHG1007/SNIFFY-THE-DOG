package com.a407.sniffythedog.application.gamelog.out;

import com.a407.sniffythedog.domain.gamelog.entity.GameLog;
import com.a407.sniffythedog.domain.gamelog.vo.GameLogId;

import java.util.Optional;

public interface GameLogPort {

    GameLog save(GameLog gameLog);

    Optional<GameLog> findById(GameLogId id);

    Optional<GameLog> findByGameHistoryId(Long gameHistoryId);
}
