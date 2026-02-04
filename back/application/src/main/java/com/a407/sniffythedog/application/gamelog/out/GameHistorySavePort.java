package com.a407.sniffythedog.application.gamelog.out;

import com.a407.sniffythedog.domain.game.entity.GameHistory;

public interface GameHistorySavePort {

    GameHistory save(GameHistory gameHistory);
}
