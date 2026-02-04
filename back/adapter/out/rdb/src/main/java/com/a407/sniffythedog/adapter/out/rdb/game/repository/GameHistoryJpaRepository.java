package com.a407.sniffythedog.adapter.out.rdb.game.repository;

import com.a407.sniffythedog.adapter.out.rdb.game.entity.GameHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameHistoryJpaRepository extends JpaRepository<GameHistoryEntity, Long> {
}
