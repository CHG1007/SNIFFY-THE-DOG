package com.a407.sniffythedog.domain.game.vo;

/**
 * Phase 종료 요청 처리 결과를 담는 VO
 */
public record PhaseEndResult(
        boolean success,
        String ignoreReason,
        PhaseTransitionResult transition
) {
    /**
     * 성공적으로 Phase가 전환된 경우
     */
    public static PhaseEndResult success(PhaseTransitionResult transition) {
        return new PhaseEndResult(true, null, transition);
    }

    /**
     * Phase 종료 요청이 무시된 경우 (멱등성 또는 유효성 검증 실패)
     */
    public static PhaseEndResult ignored(String reason) {
        return new PhaseEndResult(false, reason, null);
    }
}
