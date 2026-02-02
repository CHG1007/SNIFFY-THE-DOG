package com.a407.sniffythedog.application.auth.in;

public interface AuthUseCase {
    KakaoLoginResult execute(KakaoLoginCommand command);
    AdminLoginResult adminLogin(AdminLoginCommand command);
}
