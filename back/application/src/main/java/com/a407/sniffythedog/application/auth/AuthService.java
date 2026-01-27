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
import com.a407.sniffythedog.application.auth.out.IssuedToken;
import com.a407.sniffythedog.application.auth.out.RefreshTokenPort;
import com.a407.sniffythedog.application.auth.out.TokenIssuerPort;
import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.port.out.LoadSocialUserPort;
import com.a407.sniffythedog.application.port.out.SocialUserInfo;
import com.a407.sniffythedog.application.user.out.UserPort;
import com.a407.sniffythedog.domain.auth.RefreshToken;
import com.a407.sniffythedog.domain.user.entity.User;
import com.a407.sniffythedog.domain.user.exception.UserDomainException;
import com.a407.sniffythedog.domain.user.enums.SocialProvider;
import com.a407.sniffythedog.domain.user.vo.Nickname;
import com.a407.sniffythedog.domain.user.vo.SocialUuid;
import com.a407.sniffythedog.domain.user.vo.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthService implements AuthUseCase, SocialLoginUseCase, ReissueTokenUseCase, LogoutUseCase {

    private final UserPort userPort;
    private final RefreshTokenPort refreshTokenPort;
    private final TokenIssuerPort tokenIssuerPort;
    private final LoadSocialUserPort loadSocialUserPort;

    @Override
    @Transactional
    public KakaoLoginResult execute(KakaoLoginCommand command) {
        SocialProvider provider = parseSocialProvider(command.socialType());
        if (provider != SocialProvider.KAKAO) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "Unsupported socialType: " + command.socialType());
        }

        SocialUserInfo userInfo = loadSocialUserPort.loadUser(provider, command.token());
        SocialUuid socialUuid = SocialUuid.of(userInfo.id());

        User user = userPort.findBySocialProviderAndSocialUuid(provider, socialUuid);
        boolean isNew = false;

        if (user == null) {
            Nickname nickname = resolveNickname(userInfo.nickname(), userInfo.id());
            user = userPort.save(User.create(provider, socialUuid, nickname));
            isNew = true;
        } else {
            validateActiveUser(user);
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

        SocialUserInfo userInfo = loadSocialUserPort.loadUser(provider, command.accessToken());
        SocialUuid socialUuid = SocialUuid.of(userInfo.id());

        User user = userPort.findBySocialProviderAndSocialUuid(provider, socialUuid);
        boolean isFirstLogin = false;

        if (user == null) {
            Nickname nickname = resolveNickname(userInfo.nickname(), userInfo.id());
            user = userPort.save(User.create(provider, socialUuid, nickname));
            isFirstLogin = true;
        } else {
            validateActiveUser(user);
        }

        SocialLoginResult.UserInfo userInfoResponse = new SocialLoginResult.UserInfo(
            user.getId().value(),
            user.getNickname().value(),
            user.getRole().name(),
            user.getStatus().name()
        );

        IssuedToken accessToken = tokenIssuerPort.issueAccessToken(user.getId().value(), user.getRole().name());
        IssuedToken refreshToken = tokenIssuerPort.issueRefreshToken(user.getId().value());
        storeRefreshToken(user.getId().value(), refreshToken);

        return new SocialLoginResult(
            accessToken.token(),
            refreshToken.token(),
            isFirstLogin,
            userInfoResponse
        );
    }

    @Override
    @Transactional
    public ReissueTokenResult execute(ReissueTokenCommand command) {
        Long userId = command.userId();
        String refreshToken = command.refreshToken();
        if (userId == null || refreshToken == null || refreshToken.isBlank()) {
            throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
        }

        RefreshToken storedToken = refreshTokenPort.findByToken(refreshToken)
            .orElseThrow(() -> ApplicationException.of(ExceptionType.INVALID_TOKEN));

        if (storedToken.getExpiryDate().isBefore(Instant.now())) {
            throw ApplicationException.of(ExceptionType.EXPIRED_TOKEN);
        }

        User user = userPort.findById(UserId.of(userId));
        if (user == null) {
            throw ApplicationException.of(ExceptionType.USER_NOT_FOUND);
        }

        validateActiveUser(user);
        validateTokenOwner(user, storedToken.getUserId());

        IssuedToken newAccessToken = tokenIssuerPort.issueAccessToken(userId, user.getRole().name());
        IssuedToken newRefreshToken = tokenIssuerPort.issueRefreshToken(userId);
        rotateRefreshToken(userId, newRefreshToken);

        return new ReissueTokenResult(newAccessToken.token(), newRefreshToken.token());
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

    private void storeRefreshToken(Long userId, IssuedToken refreshToken) {
        refreshTokenPort.deleteByUserId(UserId.of(userId));
        refreshTokenPort.save(RefreshToken.create(UserId.of(userId), refreshToken.token(), refreshToken.expiresAt()));
    }

    private void rotateRefreshToken(Long userId, IssuedToken refreshToken) {
        storeRefreshToken(userId, refreshToken);
    }

    private void validateActiveUser(User user) {
        try {
            user.validateActive();
        } catch (UserDomainException e) {
            throw mapUserDomainException(e);
        }
    }

    private void validateTokenOwner(User user, UserId tokenOwnerId) {
        try {
            user.validateTokenOwner(tokenOwnerId);
        } catch (UserDomainException e) {
            throw mapUserDomainException(e);
        }
    }

    private ApplicationException mapUserDomainException(UserDomainException e) {
        String message = e.getMessage();
        if (User.ERROR_USER_BANNED.equals(message)) {
            return ApplicationException.of(ExceptionType.USER_BANNED);
        }
        if (User.ERROR_USER_DELETED.equals(message)) {
            return ApplicationException.of(ExceptionType.USER_DELETED);
        }
        if (User.ERROR_TOKEN_OWNER_MISMATCH.equals(message)) {
            return ApplicationException.of(ExceptionType.INVALID_TOKEN);
        }
        return ApplicationException.of(ExceptionType.BAD_REQUEST, message);
    }
}
