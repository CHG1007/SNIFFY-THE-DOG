package com.a407.sniffythedog.adapter.out.rdb.badge.repository;

import com.a407.sniffythedog.adapter.out.rdb.badge.entity.UserBadgeEntity;
import com.a407.sniffythedog.adapter.out.rdb.badge.mapper.UserBadgeMapper;
import com.a407.sniffythedog.application.user.out.UserBadgePort;
import com.a407.sniffythedog.domain.badge.entity.UserBadge;
import com.a407.sniffythedog.domain.user.vo.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserBadgeRepositoryAdapter implements UserBadgePort {

    private final UserBadgeJpaRepository userBadgeJpaRepository;

    @Override
    public List<UserBadge> findByUserId(UserId userId) {
        List<UserBadgeEntity> entities = userBadgeJpaRepository.findByUserIdOrderByAcquiredAtDesc(userId.value());

        return entities.stream()
            .map(UserBadgeMapper::toDomain)
            .toList();
    }
}
