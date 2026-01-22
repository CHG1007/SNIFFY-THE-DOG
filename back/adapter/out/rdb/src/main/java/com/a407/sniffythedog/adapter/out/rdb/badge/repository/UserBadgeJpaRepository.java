package com.a407.sniffythedog.adapter.out.rdb.badge.repository;

import com.a407.sniffythedog.adapter.out.rdb.badge.entity.UserBadgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeJpaRepository extends JpaRepository<UserBadgeEntity, Long> {

    List<UserBadgeEntity> findByUserIdOrderByAcquiredAtDesc(Long userId);
}
