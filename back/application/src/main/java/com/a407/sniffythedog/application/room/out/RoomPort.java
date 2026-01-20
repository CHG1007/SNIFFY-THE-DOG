package com.a407.sniffythedog.application.room.out;

import com.a407.sniffythedog.domain.game.entity.RoomSession;

import java.util.List;

public interface RoomPort {

    void saveRoom(RoomSession roomSession);
    List<RoomSession> loadPublicRooms();
}
