package com.a407.sniffythedog.adapter.out.rdb.auth.repository;

import com.a407.sniffythedog.adapter.out.rdb.auth.entity.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenJpaRepository extends JpaRepository<RefreshTokenEntity, Long> {
    Optional<RefreshTokenEntity> findByToken(String token);

    void deleteByUserId(Long userId);
}
