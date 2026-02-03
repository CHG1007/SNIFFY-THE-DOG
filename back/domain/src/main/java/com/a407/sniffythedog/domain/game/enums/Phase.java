package com.a407.sniffythedog.domain.game.enums;

public enum Phase {
    WAITING,       // 대기
    COUNTDOWN,     // 게임 시작 카운트다운
    ASSIGN_ROLE,   // 역할 배정 확인
    DAY,           // 낮 토론
    VOTE_1,        // 1차 투표 (기존 DAY_VOTE)
    DEFENSE,       // 최후변론
    VOTE_2,        // 2차 찬반 투표 (기존 FINAL_VOTE)
    NIGHT,         // 밤
    DAY_RESULT,    // 밤 결과 공개
    GAME_END;      // 게임 종료

    /**
     * Phase별 기본 지속 시간 (초)
     */
    public int getDefaultDurationSeconds() {
        return switch (this) {
            case COUNTDOWN -> 3;
            case ASSIGN_ROLE -> 3;
            case DAY -> 120;
            case VOTE_1 -> 30;
            case DEFENSE -> 30;
            case VOTE_2 -> 20;
            case NIGHT -> 30;
            case DAY_RESULT -> 5;
            default -> 0;
        };
    }
}
