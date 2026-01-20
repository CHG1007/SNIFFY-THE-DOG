package com.a407.sniffythedog.adapter.out.rdb.user.repository;

import com.a407.sniffythedog.adapter.out.rdb.user.mapper.UserMapper;
import com.a407.sniffythedog.application.user.out.UserPort;
import com.a407.sniffythedog.domain.user.entity.User;
import com.a407.sniffythedog.domain.user.vo.UserId;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
public class UserRepositoryAdapter implements UserPort {

    private final UserJpaRepository userJpaRepository;

    public UserRepositoryAdapter(UserJpaRepository userJpaRepository) {
        this.userJpaRepository = userJpaRepository;
    }

    @Override
    public Map<UserId, User> findByIds(Set<UserId> userIds) {
        Set<Long> ids = userIds.stream()
            .map(UserId::value)
            .collect(Collectors.toSet());

        return userJpaRepository.findByIdIn(ids).stream()
            .map(UserMapper::toDomain)
            .collect(Collectors.toMap(User::getId, user -> user));
    }
}
