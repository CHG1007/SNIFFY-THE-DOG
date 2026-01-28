package com.a407.sniffythedog.application.room.out;

import com.a407.sniffythedog.domain.room.vo.RoomId;
import com.a407.sniffythedog.domain.game.entity.RoomSession;


// roomId를 주면 Room을 가져다 주기
public interface LoadRoomPort {
    RoomSession loadRoom(RoomId roomId);
}
