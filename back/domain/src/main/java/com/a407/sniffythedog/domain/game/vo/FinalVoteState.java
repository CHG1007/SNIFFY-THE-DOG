package com.a407.sniffythedog.domain.game.vo;

import com.a407.sniffythedog.domain.game.enums.FinalVoteResult;
import com.a407.sniffythedog.domain.game.enums.YesNo;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public record FinalVoteState(Map<GameUserId, YesNo> votes, FinalVoteResult result) {

    public FinalVoteState {
        votes = votes == null ? Map.of() : Map.copyOf(votes);
    }

    public static FinalVoteState empty() {
        return new FinalVoteState(Map.of(), null);
    }

    public FinalVoteState vote(GameUserId voter, YesNo vote) {
        Map<GameUserId, YesNo> newVotes = new HashMap<>(votes);
        newVotes.put(voter, vote);
        return new FinalVoteState(newVotes, null);
    }

    public FinalVoteState conclude() {
        long yesCount = votes.values().stream().filter(v -> v == YesNo.YES).count();
        long noCount = votes.values().stream().filter(v -> v == YesNo.NO).count();
        // 동률이면 EXECUTE (처형)
        FinalVoteResult finalResult = yesCount >= noCount ? FinalVoteResult.EXECUTE : FinalVoteResult.SPARE;
        return new FinalVoteState(votes, finalResult);
    }

    public Optional<YesNo> getVote(GameUserId voter) {
        return Optional.ofNullable(votes.get(voter));
    }

    public long getYesCount() {
        return votes.values().stream().filter(v -> v == YesNo.YES).count();
    }

    public long getNoCount() {
        return votes.values().stream().filter(v -> v == YesNo.NO).count();
    }

    public boolean isFinalized() {
        return result != null;
    }
}
