package com.a407.sniffythedog.application.game.in;

import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.enums.GameRole;
import java.util.List;

public record MyInfo(
        Long userId,
        String nickname,
        GameRole role,
        int aiChanceRemaining,
        List<Long> mafiaMembers) {
    public static MyInfo from(PlayerState playerState) {
        return new MyInfo(
                playerState.getUserId().value(), // GameUserId VO에서 Long 추출
                playerState.getDisplayName(),
                playerState.getGameRole(),
                playerState.getRemainingChances(),
                null // 기본은 null
        );
    }

    public static MyInfo from(PlayerState playerState, List<Long> mafiaMembers) {
        return new MyInfo(
                playerState.getUserId().value(),
                playerState.getDisplayName(),
                playerState.getGameRole(),
                playerState.getRemainingChances(),
                mafiaMembers);
    }
}
