package com.a407.sniffythedog.application.room.out;

import com.a407.sniffythedog.domain.room.entity.Room;
import com.a407.sniffythedog.domain.room.vo.RoomId;

import java.util.Optional;

// roomId를 주면 Room을 가져다 주기
public interface LoadRoomPort {
    Optional<Room> loadRoom(RoomId roomId);
}
