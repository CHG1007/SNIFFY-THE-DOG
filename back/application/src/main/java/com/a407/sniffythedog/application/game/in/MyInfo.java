package com.a407.sniffythedog.application.game.in;

import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.enums.GameRole;

public record MyInfo(
        Long userId,
        String nickname,
        GameRole role,
        int aiChanceRemaining
) {
    public static MyInfo from(PlayerState playerState) {
        return new MyInfo(
                playerState.getUserId().value(),   // GameUserId VO에서 Long 추출
                playerState.getDisplayName(),
                playerState.getGameRole(),
                playerState.getRemainingChances()
        );
    }
}
