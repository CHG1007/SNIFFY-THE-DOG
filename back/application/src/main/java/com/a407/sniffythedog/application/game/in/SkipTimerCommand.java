package com.a407.sniffythedog.application.game.in;

/**
 * 타이머 스킵 요청 커맨드 (테스트용 "3초 남기기")
 */
public record SkipTimerCommand(
        String roomCode,
        Long userId,
        String phase,       // 현재 페이즈 (멱등성 검증용)
        String requestId    // 멱등성 보장용
) {}
