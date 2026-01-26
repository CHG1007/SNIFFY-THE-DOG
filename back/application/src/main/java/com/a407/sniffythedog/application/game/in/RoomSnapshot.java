package com.a407.sniffythedog.application.game.in;

import com.a407.sniffythedog.domain.game.entity.PlayerState;

public record RoomSnapshot(
        long version,
        RoomState roomState,
        MyInfo my
) {
    public static RoomSnapshot of(RoomState roomState, PlayerState myPlayer) {
        return new RoomSnapshot(
                roomState.version(),
                roomState,
                MyInfo.from(myPlayer)
        );
    }
}
