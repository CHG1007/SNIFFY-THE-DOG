package com.a407.sniffythedog.application.room.out;

import com.a407.sniffythedog.domain.game.entity.RoomSession;

public interface SaveRoomPort {
    void saveRoom(RoomSession room);
}
