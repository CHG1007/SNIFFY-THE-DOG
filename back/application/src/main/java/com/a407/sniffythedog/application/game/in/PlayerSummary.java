package com.a407.sniffythedog.application.game.in;

import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.fasterxml.jackson.annotation.JsonProperty;

public record PlayerSummary(
        Long userId,
        String nickname,
        int seatNo,
        @JsonProperty("ready")
        boolean isReady,
        boolean isAlive
) {
    public static PlayerSummary from(PlayerState player) {
        return new PlayerSummary(
                player.getUserId().value(),
                player.getDisplayName(),
                0, // seatNo는 도메인에 없으면 임시로 0 또는 별도 관리 필요. 여기선 0으로 둠.
                player.isReady(),
                player.isAlive()
        );
    }
}

