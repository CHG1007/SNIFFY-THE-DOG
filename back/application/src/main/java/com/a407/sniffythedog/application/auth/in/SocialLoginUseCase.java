package com.a407.sniffythedog.application.auth.in;

public interface SocialLoginUseCase {
    SocialLoginResult execute(SocialLoginCommand command);
}
