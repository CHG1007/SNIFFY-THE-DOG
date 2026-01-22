package com.a407.sniffythedog.domain.game.vo;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public record VoteState(Map<GameUserId, GameUserId> votes) {

    public VoteState {
        votes = votes == null ? Map.of() : Map.copyOf(votes);
    }

    public static VoteState empty() {
        return new VoteState(Map.of());
    }

    public VoteState vote(GameUserId voter, GameUserId target) {
        Map<GameUserId, GameUserId> newVotes = new HashMap<>(votes);
        newVotes.put(voter, target);
        return new VoteState(newVotes);
    }

    public Optional<GameUserId> getVote(GameUserId voter) {
        return Optional.ofNullable(votes.get(voter));
    }

    public Map<GameUserId, Long> countVotes() {
        Map<GameUserId, Long> counts = new HashMap<>();
        for (GameUserId target : votes.values()) {
            counts.merge(target, 1L, Long::sum);
        }
        return Collections.unmodifiableMap(counts);
    }

    public int getTotalVotes() {
        return votes.size();
    }
}