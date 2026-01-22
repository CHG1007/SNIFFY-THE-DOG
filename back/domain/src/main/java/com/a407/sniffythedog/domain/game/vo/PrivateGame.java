package com.a407.sniffythedog.domain.game.vo;

import java.util.UUID;

public record PrivateGame(
        boolean isPrivate,
        String inviteCode
) {
    public PrivateGame {
        if (isPrivate) {
            if (inviteCode == null || inviteCode.isBlank()) {
                inviteCode = UUID.randomUUID().toString().substring(0, 8);
            }
        } else {
            inviteCode = null;
        }
    }

    public static PrivateGame open() {
        return new PrivateGame(false, null);
    }

    public static PrivateGame closed() {
        return new PrivateGame(true, null); // 내부에서 코드 자동 생성됨
    }

    public static PrivateGame of(boolean isPrivate, String inviteCode) {
        return new PrivateGame(isPrivate, inviteCode);
    }
}