package com.a407.sniffythedog.application.auth.out;

import com.a407.sniffythedog.domain.auth.RefreshToken;
import com.a407.sniffythedog.domain.user.vo.UserId;

import java.util.Optional;

public interface RefreshTokenPort {
    RefreshToken save(RefreshToken refreshToken);

    Optional<RefreshToken> findByToken(String token);

    void deleteByUserId(UserId userId);
}
