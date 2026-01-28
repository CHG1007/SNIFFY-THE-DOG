package com.a407.sniffythedog.adapter.in.common.room.message;
import com.a407.sniffythedog.application.game.in.RoomState;
import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record RoomPlayerLeftMessage(
        String type,                 // "ROOM_PLAYER_LEFT"
        String roomCode,             // e.g. "ABCD12"
        long version,                // room version
        OffsetDateTime timestamp,    // server time
        Data data
) {
    @Builder
    public record Data(
            Long userId,             // 나간 사람
            RoomState roomState      // 최신 룸 스냅샷(인원/호스트/상태 등)
    ) {}
}
