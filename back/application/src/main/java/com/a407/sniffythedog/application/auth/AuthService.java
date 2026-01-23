package com.a407.sniffythedog.application.auth;

import com.a407.sniffythedog.application.auth.in.AuthUseCase;
import com.a407.sniffythedog.application.auth.in.KakaoLoginCommand;
import com.a407.sniffythedog.application.auth.in.KakaoLoginResult;
import com.a407.sniffythedog.application.auth.in.LogoutUseCase;
import com.a407.sniffythedog.application.auth.in.ReissueTokenCommand;
import com.a407.sniffythedog.application.auth.in.ReissueTokenResult;
import com.a407.sniffythedog.application.auth.in.ReissueTokenUseCase;
import com.a407.sniffythedog.application.auth.in.SocialLoginCommand;
import com.a407.sniffythedog.application.auth.in.SocialLoginResult;
import com.a407.sniffythedog.application.auth.in.SocialLoginUseCase;
import com.a407.sniffythedog.application.auth.out.RefreshTokenPort;
import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.global.jwt.JwtProvider;
import com.a407.sniffythedog.application.user.out.UserPort;
import com.a407.sniffythedog.domain.auth.RefreshToken;
import com.a407.sniffythedog.domain.user.entity.User;
import com.a407.sniffythedog.domain.user.enums.SocialProvider;
import com.a407.sniffythedog.domain.user.vo.Nickname;
import com.a407.sniffythedog.domain.user.vo.SocialUuid;
import com.a407.sniffythedog.domain.user.vo.UserId;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuthService implements AuthUseCase, SocialLoginUseCase, ReissueTokenUseCase, LogoutUseCase {

    private static final String KAKAO_REST_API_KEY_HEADER = "X-Kakao-REST-API-KEY";

    private final UserPort userPort;
    private final RefreshTokenPort refreshTokenPort;
    private final JwtProvider jwtProvider;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${kakao.rest-api-key}")
    private String kakaoRestApiKey;

    @Value("${kakao.user-info-url:https://kapi.kakao.com/v2/user/me}")
    private String kakaoUserInfoUrl;

    @Override
    @Transactional
    public KakaoLoginResult execute(KakaoLoginCommand command) {
        SocialProvider provider = parseSocialProvider(command.socialType());
        if (provider != SocialProvider.KAKAO) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "Unsupported socialType: " + command.socialType());
        }

        KakaoUserInfo userInfo = fetchKakaoUserInfo(command.token());
        SocialUuid socialUuid = SocialUuid.of(userInfo.id());

        User user = userPort.findBySocialProviderAndSocialUuid(provider, socialUuid);
        boolean isNew = false;

        if (user == null) {
            Nickname nickname = resolveNickname(userInfo.nickname(), userInfo.id());
            user = userPort.save(User.create(provider, socialUuid, nickname));
            isNew = true;
        } else {
            if (user.isBanned()) {
                throw ApplicationException.of(ExceptionType.USER_BANNED);
            }
            if (!user.isActive()) {
                throw ApplicationException.of(ExceptionType.USER_DELETED);
            }
        }

        return new KakaoLoginResult(
            user.getId().value(),
            user.getNickname().value(),
            user.getSocialProvider().name(),
            isNew
        );
    }

    @Override
    @Transactional
    public SocialLoginResult execute(SocialLoginCommand command) {
        SocialProvider provider = parseSocialProvider(command.social());
        if (provider != SocialProvider.KAKAO) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "Unsupported social: " + command.social());
        }

        KakaoUserInfo userInfo = fetchKakaoUserInfo(command.accessToken());
        SocialUuid socialUuid = SocialUuid.of(userInfo.id());

        User user = userPort.findBySocialProviderAndSocialUuid(provider, socialUuid);
        boolean isFirstLogin = false;

        if (user == null) {
            Nickname nickname = resolveNickname(userInfo.nickname(), userInfo.id());
            user = userPort.save(User.create(provider, socialUuid, nickname));
            isFirstLogin = true;
        } else {
            if (user.isBanned()) {
                throw ApplicationException.of(ExceptionType.USER_BANNED);
            }
            if (!user.isActive()) {
                throw ApplicationException.of(ExceptionType.USER_DELETED);
            }
        }

        SocialLoginResult.UserInfo userInfoResponse = new SocialLoginResult.UserInfo(
            user.getId().value(),
            user.getNickname().value(),
            user.getRole().name(),
            user.getStatus().name()
        );

        String accessToken = jwtProvider.generateAccessToken(user.getId().value(), user.getRole().name());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId().value());
        storeRefreshToken(user.getId().value(), refreshToken);

        return new SocialLoginResult(
            accessToken,
            refreshToken,
            isFirstLogin,
            userInfoResponse
        );
    }

    @Override
    @Transactional
    public ReissueTokenResult execute(ReissueTokenCommand command) {
        Claims claims = parseRefreshTokenClaims(command.refreshToken());

        Long userId = parseUserId(claims);
        RefreshToken storedToken = refreshTokenPort.findByToken(command.refreshToken())
            .orElseThrow(() -> ApplicationException.of(ExceptionType.INVALID_TOKEN));

        if (!storedToken.getUserId().value().equals(userId)) {
            throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
        }

        User user = userPort.findById(UserId.of(userId));
        if (user == null) {
            throw ApplicationException.of(ExceptionType.USER_NOT_FOUND);
        }
        if (user.isBanned()) {
            throw ApplicationException.of(ExceptionType.USER_BANNED);
        }
        if (!user.isActive()) {
            throw ApplicationException.of(ExceptionType.USER_DELETED);
        }

        String newAccessToken = jwtProvider.generateAccessToken(userId, user.getRole().name());
        String newRefreshToken = jwtProvider.generateRefreshToken(userId);
        rotateRefreshToken(userId, newRefreshToken);

        return new ReissueTokenResult(newAccessToken, newRefreshToken);
    }

    @Override
    @Transactional
    public void logout(Long userId) {
        // Remove stored refresh token to complete logout.
        refreshTokenPort.deleteByUserId(UserId.of(userId));
    }

    private SocialProvider parseSocialProvider(String socialType) {
        if (socialType == null || socialType.isBlank()) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "socialType is required");
        }
        try {
            return SocialProvider.valueOf(socialType.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "Unsupported socialType: " + socialType);
        }
    }

    private KakaoUserInfo fetchKakaoUserInfo(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.add(KAKAO_REST_API_KEY_HEADER, kakaoRestApiKey);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                kakaoUserInfoUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            Map body = response.getBody();
            if (body == null) {
                throw ApplicationException.of(ExceptionType.OAUTH_FAILED);
            }

            Object idValue = body.get("id");
            if (!(idValue instanceof Number idNumber)) {
                throw ApplicationException.of(ExceptionType.OAUTH_FAILED);
            }

            String nickname = extractNickname(body);
            return new KakaoUserInfo(String.valueOf(idNumber.longValue()), nickname);
        } catch (RestClientResponseException e) {
            if (e.getRawStatusCode() == 401) {
                throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
            }
            throw ApplicationException.of(ExceptionType.OAUTH_FAILED);
        } catch (RestClientException e) {
            throw ApplicationException.of(ExceptionType.OAUTH_FAILED);
        }
    }

    private String extractNickname(Map body) {
        Object kakaoAccountValue = body.get("kakao_account");
        if (!(kakaoAccountValue instanceof Map<?, ?> kakaoAccount)) {
            return null;
        }

        Object profileValue = kakaoAccount.get("profile");
        if (!(profileValue instanceof Map<?, ?> profile)) {
            return null;
        }

        Object nicknameValue = profile.get("nickname");
        if (nicknameValue instanceof String nickname && !nickname.isBlank()) {
            return nickname;
        }

        return null;
    }

    private Nickname resolveNickname(String nickname, String kakaoId) {
        String candidate = nickname != null ? nickname.trim() : "";
        if (!candidate.isBlank()) {
            try {
                return Nickname.of(candidate);
            } catch (IllegalArgumentException ignored) {
                // fall through
            }
        }

        String fallbackId = Objects.requireNonNullElse(kakaoId, "");
        String digitsOnly = fallbackId.replaceAll("\\D", "");
        if (digitsOnly.isBlank()) {
            digitsOnly = String.valueOf(System.currentTimeMillis());
        }

        String prefix = "kakao";
        int maxSuffixLength = Math.max(0, 20 - prefix.length());
        String suffix = digitsOnly.length() > maxSuffixLength
            ? digitsOnly.substring(digitsOnly.length() - maxSuffixLength)
            : digitsOnly;

        return Nickname.of(prefix + suffix);
    }

    private Claims parseRefreshTokenClaims(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
        }
        try {
            return jwtProvider.getClaims(refreshToken);
        } catch (ExpiredJwtException e) {
            throw ApplicationException.of(ExceptionType.EXPIRED_TOKEN);
        } catch (JwtException | IllegalArgumentException e) {
            throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
        }
    }

    private Long parseUserId(Claims claims) {
        String subject = claims.getSubject();
        if (subject == null || subject.isBlank()) {
            throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
        }
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
        }
    }

    private void storeRefreshToken(Long userId, String refreshToken) {
        Instant expiryDate = jwtProvider.getClaims(refreshToken).getExpiration().toInstant();
        refreshTokenPort.deleteByUserId(UserId.of(userId));
        refreshTokenPort.save(RefreshToken.create(UserId.of(userId), refreshToken, expiryDate));
    }

    private void rotateRefreshToken(Long userId, String refreshToken) {
        storeRefreshToken(userId, refreshToken);
    }

    private record KakaoUserInfo(String id, String nickname) {
    }
}
