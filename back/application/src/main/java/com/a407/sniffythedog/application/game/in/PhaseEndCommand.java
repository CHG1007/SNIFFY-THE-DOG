package com.a407.sniffythedog.application.game.in;

/**
 * Phase 종료 요청 Command
 */
public record PhaseEndCommand(
        String roomCode,
        Long userId,
        String phase,       // 클라이언트가 종료 요청하는 phase
        String requestId    // 멱등성 보장용 (선택적)
) {}
