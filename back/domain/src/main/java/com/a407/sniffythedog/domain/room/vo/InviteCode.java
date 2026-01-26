package com.a407.sniffythedog.domain.room.vo;

public record InviteCode(String value) {
    public InviteCode {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("inviteCode is blank");
        }
        // 6자리 대문자/숫자 규칙이면 유지
        if (!value.matches("^[A-Z0-9]{6}$")) {
            throw new IllegalArgumentException("invalid inviteCode format");
        }
    }

    public static InviteCode of(String value) {
        return new InviteCode(value);
    }
}
