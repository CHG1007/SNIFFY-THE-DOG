package com.a407.sniffythedog.adapter.out.rdb.game.repository;

import com.a407.sniffythedog.adapter.out.rdb.game.entity.ParticipantEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParticipantJpaRepository extends JpaRepository<ParticipantEntity, Long> {

    @Query("SELECT p FROM ParticipantEntity p JOIN FETCH p.gameHistory WHERE p.userId = :userId")
    Page<ParticipantEntity> findByUserIdWithGameHistory(@Param("userId") Long userId, Pageable pageable);
}
