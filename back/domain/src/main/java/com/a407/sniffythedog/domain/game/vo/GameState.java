package com.a407.sniffythedog.domain.game.vo;

import com.a407.sniffythedog.domain.game.enums.Phase;

import java.time.Instant;
import java.util.Objects;

public record GameState(
        int round,
        Phase phase,
        Instant phaseEndsAt,
        VoteState dayVote,
        TrialState trial,
        NightState night
) {

    public GameState {
        if (round < 1) throw new IllegalArgumentException("round must be at least 1");
        Objects.requireNonNull(phase, "phase must not be null");
        Objects.requireNonNull(phaseEndsAt, "phaseEndsAt must not be null");
        dayVote = dayVote == null ? VoteState.empty() : dayVote;
        trial = trial == null ? TrialState.empty() : trial;
        night = night == null ? NightState.empty() : night;
    }

    public static GameState initial() {
        return new GameState(
                1,
                Phase.WAITING,
                Instant.now(),
                VoteState.empty(),
                TrialState.empty(),
                NightState.empty()
        );
    }

    public GameState toPhase(Phase newPhase, Instant endsAt) {
        return new GameState(round, newPhase, endsAt, dayVote, trial, night);
    }

    public GameState toNextRound(Instant phaseEndsAt) {
        return new GameState(
                round + 1,
                Phase.DAY,
                phaseEndsAt,
                VoteState.empty(),
                TrialState.empty(),
                NightState.empty()
        );
    }

    public GameState withDayVote(VoteState newDayVote) {
        return new GameState(round, phase, phaseEndsAt, newDayVote, trial, night);
    }

    public GameState withTrial(TrialState newTrial) {
        return new GameState(round, phase, phaseEndsAt, dayVote, newTrial, night);
    }

    public GameState withNight(NightState newNight) {
        return new GameState(round, phase, phaseEndsAt, dayVote, trial, newNight);
    }

    public boolean isPhaseExpired() {
        return Instant.now().isAfter(phaseEndsAt);
    }
}
