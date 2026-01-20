package com.a407.sniffythedog.domain.game.vo;

public record PhaseTiming(
        int daySec,
        int dayVoteSec,
        int defenseSec,
        int finalVoteSec,
        int nightSec
) {

    public PhaseTiming {
        if (daySec <= 0) throw new IllegalArgumentException("daySec must be positive");
        if (dayVoteSec <= 0) throw new IllegalArgumentException("dayVoteSec must be positive");
        if (defenseSec <= 0) throw new IllegalArgumentException("defenseSec must be positive");
        if (finalVoteSec <= 0) throw new IllegalArgumentException("finalVoteSec must be positive");
        if (nightSec <= 0) throw new IllegalArgumentException("nightSec must be positive");
    }

    public static PhaseTiming defaultTiming() {
        return new PhaseTiming(180, 30, 30, 20, 30);
    }
}
