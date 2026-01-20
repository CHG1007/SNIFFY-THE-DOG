package com.a407.sniffythedog.adapter.out.rdb.user.repository;

import com.a407.sniffythedog.adapter.out.rdb.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Set;

public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {

    List<UserEntity> findByIdIn(Set<Long> ids);
}
