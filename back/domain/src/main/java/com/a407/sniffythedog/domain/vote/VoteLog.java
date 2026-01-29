package com.a407.sniffythedog.domain.vote;

public record VoteLog(
        int round,
        String phase,          // "DAY_VOTE1", "TRIAL_VOTE2" 등
        String eventType,      // "VOTE_CAST", "VOTE_RESULT"
        Long voterUserId,      // cast일 때
        Long targetUserId,     // 1차 지목 대상
        String yesNo,          // 2차 YES/NO
        Long accusedUserId,    // 결과일 때
        Boolean approved,      // 결과일 때
        Boolean isTie,         // 1차 결과일 때
        Long yesCount,         // 2차 결과일 때
        Long noCount,          // 2차 결과일 때
        long version,
        long tsEpochMillis
) {}
