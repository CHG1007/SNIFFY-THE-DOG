package com.a407.sniffythedog.application.user.in;

public interface ChangeNicknameUseCase {
    GetMyInfoResult execute(ChangeNicknameCommand command);
}
