package com.a407.sniffythedog.adapter.in.http.auth;

import com.a407.sniffythedog.adapter.in.http.auth.request.AdminLoginRequest;
import com.a407.sniffythedog.adapter.in.http.auth.request.KakaoLoginRequest;
import com.a407.sniffythedog.adapter.in.http.auth.request.RefreshTokenRequest;
import com.a407.sniffythedog.adapter.in.http.auth.request.SocialLoginRequest;
import com.a407.sniffythedog.adapter.in.http.auth.response.AdminLoginResponse;
import com.a407.sniffythedog.adapter.in.http.auth.response.KakaoLoginResponse;
import com.a407.sniffythedog.adapter.in.http.auth.request.SocialLoginRequest;
import com.a407.sniffythedog.adapter.in.http.auth.response.KakaoLoginResponse;
import com.a407.sniffythedog.adapter.in.http.auth.response.RefreshTokenResponse;
import com.a407.sniffythedog.adapter.in.http.auth.response.SocialLoginResponse;
import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.global.jwt.JwtProvider;
import com.a407.sniffythedog.application.auth.in.AuthUseCase;
import com.a407.sniffythedog.application.auth.in.AdminLoginResult;
import com.a407.sniffythedog.application.auth.in.KakaoLoginResult;
import com.a407.sniffythedog.application.auth.in.LogoutUseCase;
import com.a407.sniffythedog.application.auth.in.ReissueTokenResult;
import com.a407.sniffythedog.application.auth.in.ReissueTokenUseCase;
import com.a407.sniffythedog.application.auth.in.SocialLoginResult;
import com.a407.sniffythedog.application.auth.in.SocialLoginUseCase;
import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;
    private final SocialLoginUseCase socialLoginUseCase;
    private final ReissueTokenUseCase reissueTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final JwtProvider jwtProvider;

    @PostMapping("/api/v1/auth/admin")
    public ApiResponse<AdminLoginResponse> loginWithAdmin(@Valid @RequestBody AdminLoginRequest request) {
        AdminLoginResult result = authUseCase.adminLogin(request.toCommand());
        return ApiResponse.success(AdminLoginResponse.from(result));
    }

    @PostMapping("/api/auth/login/kakao")
    public ApiResponse<KakaoLoginResponse> loginWithKakao(@Valid @RequestBody KakaoLoginRequest request) {
        KakaoLoginResult result = authUseCase.execute(request.toCommand());
        return ApiResponse.success(KakaoLoginResponse.from(result));
    }

    @PostMapping("/api/v1/auth/{social}")
    public ApiResponse<SocialLoginResponse> loginWithSocial(
        @PathVariable String social,
        @Valid @RequestBody SocialLoginRequest request
    ) {
        SocialLoginResult result = socialLoginUseCase.execute(request.toCommand(social));
        return ApiResponse.success(SocialLoginResponse.from(result));
    }

    @PostMapping("/api/v1/auth/refresh")
    public ApiResponse<RefreshTokenResponse> reissueToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            JwtProvider.ParsedToken parsedToken = jwtProvider.parseRefreshToken(request.refreshToken());
            ReissueTokenResult result = reissueTokenUseCase.execute(request.toCommand(parsedToken.userId()));
            return ApiResponse.success(RefreshTokenResponse.from(result));
        } catch (ExpiredJwtException e) {
            throw ApplicationException.of(ExceptionType.EXPIRED_TOKEN);
        } catch (JwtException | IllegalArgumentException e) {
            throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
        }
    }

    @PostMapping("/api/v1/auth/logout")
    public ApiResponse<Void> logout(@AuthenticationPrincipal(expression = "userId") Long userId) {
        // Delete the user's refresh token so it can no longer be used.
        logoutUseCase.logout(userId);
        return ApiResponse.success();
    }
}
