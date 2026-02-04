package com.a407.sniffythedog.domain.gamelog.vo;

import com.a407.sniffythedog.domain.gamelog.enums.GameEventType;
import com.a407.sniffythedog.domain.game.enums.Phase;

import java.time.Instant;
import java.util.Objects;

public record GameEvent(
        GameEventType type,
        int round,

        Long actorUserId,
        Long targetUserId,

        Boolean voteResult,
        Boolean isMafia,

        Long mafiaTargetUserId,   // NIGHT_RESOLVE에서 기록
        Long doctorTargetUserId,  // NIGHT_RESOLVE에서 기록
        Long killedUserId,        // NIGHT_RESOLVE / KILL에서 기록
        Boolean saved,           // NIGHT_RESOLVE에서 기록(의사가 막았는지)

        Long agreeCount,
        Long disagreeCount,

        Phase phase,              // PHASE_CHANGED에서 기록
        String winnerTeam,        // GAME_FINISHED에서 기록

        Instant timestamp

) {

    public GameEvent {
        Objects.requireNonNull(type, "type must not be null");
        if (round < 1) throw new IllegalArgumentException("round must be at least 1");
        Objects.requireNonNull(timestamp, "timestamp must not be null");
    }

    public GameEvent(
            GameEventType type,
            int round,
            Long actorUserId,
            Long targetUserId,
            Boolean voteResult,
            Instant timestamp
    ) {
        this(type, round,
                actorUserId, targetUserId,
                voteResult,
                null,
                null, null, null, null,
                null,null,
                null, null,
                timestamp);
    }

    public static GameEvent mafiaTarget(int round, Long targetUserId) {
        return new GameEvent(GameEventType.MAFIA_TARGET, round, null, targetUserId, null,
                null,null, null, null, null,null,null,
                null, null,
                Instant.now());
    }

    public static GameEvent doctorSave(int round, Long doctorUserId, Long targetUserId) {
        return new GameEvent(GameEventType.DOCTOR_SAVE, round, doctorUserId, targetUserId, null,
                null,null, null, null, null,null,null,
                null, null,
                Instant.now());
    }

    public static GameEvent policeCheck(int round, Long policeUserId, Long targetUserId, boolean isMafia) {
        return new GameEvent(GameEventType.POLICE_CHECK, round, policeUserId,
                targetUserId, null, isMafia, null, null, null, null, null,null,null, null,
                Instant.now()
        );
    }


    public static GameEvent kill(int round, Long killedUserId) {
        return new GameEvent(GameEventType.KILL, round, null, killedUserId, null,
                null,null, null, killedUserId, null,null,null,
                null, null,
                Instant.now());
    }

    public static GameEvent execute(int round, Long executedUserId) {
        return new GameEvent(GameEventType.EXECUTE, round, null, executedUserId, null,
                null,null, null, executedUserId,null,null, null,
                null, null,
                Instant.now());
    }


    public static GameEvent nightResolve(int round,
                                         Long mafiaTargetUserId,
                                         Long doctorTargetUserId,
                                         Long killedUserId,
                                         boolean saved) {
        return new GameEvent(GameEventType.NIGHT_RESOLVE, round, null, null, null,
                null,mafiaTargetUserId, doctorTargetUserId, killedUserId, saved,null,null,
                null,null,
                Instant.now());
    }

    public static GameEvent phaseChanged(int round, Phase phase) {
        return new GameEvent(GameEventType.PHASE_CHANGED, round, null, null, null
                ,null,null, null, null, null,null,null,
                phase, null,
                Instant.now());
    }

    public static GameEvent gameFinished(int round, String winnerTeam) {
        return new GameEvent(GameEventType.GAME_FINISHED, round, null, null, null
                ,null,null, null, null, null,null,null,
                null, winnerTeam,
                Instant.now());
    }

    // 1차투표 한표
    public static GameEvent vote1Cast(int round, long voterUserId, long targetUserId) {
        return new GameEvent(
                GameEventType.VOTE1_CAST,
                round,
                voterUserId,
                targetUserId,
                null,
                null,
                null, null, null, null,null,null,
                Phase.DAY,
                null,
                Instant.now()
        );
    }
    // 1차 투표 결과
    public static GameEvent vote1Result(int round, Long accusedUserId, boolean isTie) {
        return new GameEvent(
                GameEventType.VOTE1_RESULT,
                round,
                null,
                accusedUserId,   // 단독이면 값, 동점이면 null
                isTie,           // voteResult를 isTie로 재활용
                null,
                null, null, null, null,null,null,
                Phase.DAY,
                null,
                Instant.now()
        );
    }

    // 2차 투표 한 표 (YES=true / NO=false)
    public static GameEvent vote2Cast(int round, long voterUserId, boolean yes) {
        return new GameEvent(
                GameEventType.VOTE2_CAST,
                round,
                voterUserId,
                null,
                yes,
                null,
                null, null, null, null,null,null,
                Phase.DAY,
                null,
                Instant.now()
        );
    }

    // 2차 투표 집계 결과
    public static GameEvent vote2Result(
            int round,
            boolean approved,
            Long executedUserId,
            Boolean executedIsMafia,
            long yesCount,
            long noCount
    ) {
        return new GameEvent(
                GameEventType.VOTE2_RESULT,
                round,
                null,
                executedUserId,
                approved,
                executedIsMafia,
                null, null,
                executedUserId,
                null,
                yesCount,
                noCount,
                Phase.DAY,
                null,
                Instant.now()
        );
    }

    // AI 분석 결과
    public static GameEvent aiAnalysis(int round, Long actorUserId, Long targetUserId, String gmsResult) {
        return new GameEvent(
                GameEventType.AI_ANALYSIS,
                round,
                actorUserId, // 분석 시도
                targetUserId, // 분석 당한 대상
                null,
                null,
                null, null, null, null, null, null,
                null,
                gmsResult,
                Instant.now()
        );
    }

}
