package com.a407.sniffythedog.application.port.out.room;

import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.RoomId;

import java.util.List;
import java.util.Optional;

public interface RoomPort {

    void saveRoom(RoomSession roomSession);
    List<RoomSession> loadPublicRooms();
}
