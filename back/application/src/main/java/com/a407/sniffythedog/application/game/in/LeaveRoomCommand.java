package com.a407.sniffythedog.application.game.in;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;

public record LeaveRoomCommand(
        String roomCode,
        Long userId
) {
    public LeaveRoomCommand {
        if (roomCode == null || roomCode.isBlank()) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "방 코드는 필수입니다");
        }
        if (userId == null) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "사용자 ID는 필수입니다");
        }
    }
}
