package com.a407.sniffythedog.application.room.out;

import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.RoomId;


import java.util.List;
import java.util.Optional;

public interface RedisRoomPort {
    void saveRoom(RoomSession roomSession);
    List<RoomSession> loadPublicRooms(int page, int size);
    Optional<RoomSession> loadRoom(RoomId roomId);
    Optional<RoomSession> loadRoomByInviteCode(String inviteCode);
}
