package com.a407.sniffythedog.domain.game.vo;

import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.enums.Winner;

/**
 * Phase 전환 결과를 담는 VO
 */
public record PhaseTransitionResult(
        Phase nextPhase,
        GameUserId accusedUserId,  // VOTE_1 → DEFENSE/VOTE_2 전환 시 지목된 유저
        GameUserId killedUserId,   // NIGHT → DAY_RESULT 전환 시 사망한 유저
        boolean saved,             // 의사가 살렸는지
        boolean isTie,             // VOTE_1 동점 여부
        Winner winner,             // 게임 종료 시 승자
        // VOTE_2 결과
        Boolean vote2Approved,     // 찬반 투표 통과 여부 (null = 투표 없음)
        GameUserId executedUserId, // 처형된 유저
        Long vote2YesCount,        // 찬성 수
        Long vote2NoCount          // 반대 수
) {
    /**
     * 단순 Phase 전환
     */
    public static PhaseTransitionResult simple(Phase nextPhase) {
        return new PhaseTransitionResult(nextPhase, null, null, false, false, null, null, null, null, null);
    }

    /**
     * VOTE_1 결과 - 지목된 유저가 있는 경우
     */
    public static PhaseTransitionResult withAccused(Phase nextPhase, GameUserId accused) {
        return new PhaseTransitionResult(nextPhase, accused, null, false, false, null, null, null, null, null);
    }

    /**
     * VOTE_1 결과 - 동점인 경우
     */
    public static PhaseTransitionResult tie(Phase nextPhase) {
        return new PhaseTransitionResult(nextPhase, null, null, false, true, null, null, null, null, null);
    }

    /**
     * NIGHT 결과 - 사망자 발생
     */
    public static PhaseTransitionResult withKill(Phase nextPhase, GameUserId killed, boolean saved) {
        return new PhaseTransitionResult(nextPhase, null, killed, saved, false, null, null, null, null, null);
    }

    /**
     * 게임 종료
     */
    public static PhaseTransitionResult gameEnd(Winner winner) {
        return new PhaseTransitionResult(Phase.GAME_END, null, null, false, false, winner, null, null, null, null);
    }

    /**
     * VOTE_2 결과 - 찬반 투표
     */
    public static PhaseTransitionResult withVote2Result(Phase nextPhase, boolean approved, GameUserId executedUserId, long yesCount, long noCount) {
        return new PhaseTransitionResult(nextPhase, null, null, false, false, null, approved, executedUserId, yesCount, noCount);
    }

    /**
     * 게임이 종료되었는지
     */
    public boolean isGameEnded() {
        return nextPhase == Phase.GAME_END || winner != null;
    }
}
