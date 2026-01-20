package com.a407.sniffythedog.adapter.out.rdb.user.repository;

import com.a407.sniffythedog.adapter.out.rdb.user.entity.UserEntity;
import com.a407.sniffythedog.adapter.out.rdb.user.mapper.UserMapper;
import com.a407.sniffythedog.application.user.out.UserPort;
import com.a407.sniffythedog.domain.user.entity.User;
import com.a407.sniffythedog.domain.user.vo.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserPort {

    private final UserJpaRepository userJpaRepository;

    @Override
    public Map<UserId, User> findByIds(Set<UserId> userIds) {
        Set<Long> ids = userIds.stream()
            .map(UserId::value)
            .collect(Collectors.toSet());

        return userJpaRepository.findByIdIn(ids).stream()
            .map(UserMapper::toDomain)
            .collect(Collectors.toMap(User::getId, user -> user));
    }

    @Override
    public User findById(UserId userId) {
        return userJpaRepository.findById(userId.value())
            .map(UserMapper::toDomain)
            .orElse(null);
    }

    @Override
    public User save(User user) {
        UserEntity entity = UserMapper.toEntity(user);
        UserEntity savedEntity = userJpaRepository.save(entity);
        return UserMapper.toDomain(savedEntity);
    }
}
