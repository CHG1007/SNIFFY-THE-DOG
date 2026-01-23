package com.a407.sniffythedog.application.global.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtProvider {

    private final SecretKey secretKey;
    private final long accessTokenValiditySeconds;
    private final long refreshTokenValiditySeconds;

    public JwtProvider(
        @Value("${jwt.secret}") String secret,
        @Value("${jwt.access-token-validity-in-seconds}") long accessTokenValiditySeconds,
        @Value("${jwt.refresh-token-validity-in-seconds}") long refreshTokenValiditySeconds
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValiditySeconds = accessTokenValiditySeconds;
        this.refreshTokenValiditySeconds = refreshTokenValiditySeconds;
    }

    public String generateAccessToken(Long userId, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("role", role)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(accessTokenValiditySeconds)))
            .signWith(secretKey, Jwts.SIG.HS256)
            .compact();
    }

    public String generateRefreshToken(Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(refreshTokenValiditySeconds)))
            .signWith(secretKey, Jwts.SIG.HS256)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getUserId(String token) {
        String subject = getClaims(token).getSubject();
        return Long.parseLong(subject);
    }

    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
