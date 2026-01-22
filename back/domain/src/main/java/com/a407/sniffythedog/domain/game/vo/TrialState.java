package com.a407.sniffythedog.domain.game.vo;

public record TrialState(GameUserId accusedUserId, FinalVoteState finalVote) {

    public TrialState {
        finalVote = finalVote == null ? FinalVoteState.empty() : finalVote;
    }

    public static TrialState empty() {
        return new TrialState(null, FinalVoteState.empty());
    }

    public static TrialState withAccused(GameUserId accusedUserId) {
        return new TrialState(accusedUserId, FinalVoteState.empty());
    }

    public TrialState vote(GameUserId voter, com.a407.sniffythedog.domain.game.enums.YesNo vote) {
        return new TrialState(accusedUserId, finalVote.vote(voter, vote));
    }

    public TrialState conclude() {
        return new TrialState(accusedUserId, finalVote.conclude());
    }

    public boolean hasAccused() {
        return accusedUserId != null;
    }
}
