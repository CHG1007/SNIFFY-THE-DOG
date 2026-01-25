package com.a407.sniffythedog.application.room.out;

import com.a407.sniffythedog.domain.room.vo.InviteCode;
import com.a407.sniffythedog.domain.room.vo.RoomId;

import java.util.Optional;

// invitecode -> roomId로 바꿈
public interface LoadInviteCodePort {
    Optional<RoomId> findRoomIdByInviteCode(InviteCode inviteCode);
}
