package com.a407.sniffythedog.application.user.in;

public record ChangeNicknameCommand(
    Long userId,
    String newNickname
) {
}
