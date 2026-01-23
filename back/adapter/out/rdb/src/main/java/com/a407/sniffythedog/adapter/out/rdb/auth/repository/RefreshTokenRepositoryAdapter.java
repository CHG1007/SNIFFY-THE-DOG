package com.a407.sniffythedog.adapter.out.rdb.auth.repository;

import com.a407.sniffythedog.adapter.out.rdb.auth.entity.RefreshTokenEntity;
import com.a407.sniffythedog.adapter.out.rdb.auth.mapper.RefreshTokenMapper;
import com.a407.sniffythedog.application.auth.out.RefreshTokenPort;
import com.a407.sniffythedog.domain.auth.RefreshToken;
import com.a407.sniffythedog.domain.user.vo.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RefreshTokenRepositoryAdapter implements RefreshTokenPort {

    private final RefreshTokenJpaRepository refreshTokenJpaRepository;

    @Override
    public RefreshToken save(RefreshToken refreshToken) {
        RefreshTokenEntity entity = RefreshTokenMapper.toEntity(refreshToken);
        RefreshTokenEntity savedEntity = refreshTokenJpaRepository.save(entity);
        return RefreshTokenMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenJpaRepository.findByToken(token)
            .map(RefreshTokenMapper::toDomain);
    }

    @Override
    public void deleteByUserId(UserId userId) {
        refreshTokenJpaRepository.deleteByUserId(userId.value());
    }
}
