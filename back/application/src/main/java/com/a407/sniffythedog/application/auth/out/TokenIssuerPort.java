package com.a407.sniffythedog.application.auth.out;

public interface TokenIssuerPort {
    IssuedToken issueAccessToken(Long userId, String role);

    IssuedToken issueRefreshToken(Long userId);
}
