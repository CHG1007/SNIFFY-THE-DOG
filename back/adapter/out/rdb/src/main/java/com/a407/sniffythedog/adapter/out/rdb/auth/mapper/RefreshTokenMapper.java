package com.a407.sniffythedog.adapter.out.rdb.auth.mapper;

import com.a407.sniffythedog.adapter.out.rdb.auth.entity.RefreshTokenEntity;
import com.a407.sniffythedog.domain.auth.RefreshToken;
import com.a407.sniffythedog.domain.user.vo.UserId;

public class RefreshTokenMapper {

    private RefreshTokenMapper() {
    }

    public static RefreshTokenEntity toEntity(RefreshToken refreshToken) {
        return new RefreshTokenEntity(
            refreshToken.getUserId().value(),
            refreshToken.getToken(),
            refreshToken.getExpiryDate()
        );
    }

    public static RefreshToken toDomain(RefreshTokenEntity entity) {
        return RefreshToken.reconstitute(
            UserId.of(entity.getUserId()),
            entity.getToken(),
            entity.getExpiryDate()
        );
    }
}
