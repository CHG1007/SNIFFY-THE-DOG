package com.a407.sniffythedog.application.room.out;

import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.RoomId;


import java.util.List;
import java.util.Optional;
import java.util.function.UnaryOperator;

public interface RedisRoomPort {
    void saveRoom(RoomSession roomSession);
    List<RoomSession> loadPublicRooms(int page, int size);
    Optional<RoomSession> loadRoom(RoomId roomId);
    Optional<RoomSession> loadRoomByInviteCode(String inviteCode);
    void deleteRoom(String roomId);

    // 정원 7명일때 a,b가 동시에 들어와서 정원 넘치는 경우 방지, 원자 갱신 메서드
    RoomSession updateRoomAtomically(RoomId roomId, UnaryOperator<RoomSession> mutator);
}
