package com.a407.sniffythedog.application.game.in;

import com.a407.sniffythedog.domain.game.entity.PlayerState;
import java.util.List;

public record RoomSnapshot(
        long version,
        RoomState roomState,
        MyInfo my) {
    public static RoomSnapshot of(RoomState roomState, PlayerState myPlayer) {
        return new RoomSnapshot(
                roomState.version(),
                roomState,
                MyInfo.from(myPlayer));
    }

    public static RoomSnapshot of(RoomState roomState, PlayerState myPlayer, List<Long> mafiaMembers) {
        return new RoomSnapshot(
                roomState.version(),
                roomState,
                MyInfo.from(myPlayer, mafiaMembers));
    }
}
