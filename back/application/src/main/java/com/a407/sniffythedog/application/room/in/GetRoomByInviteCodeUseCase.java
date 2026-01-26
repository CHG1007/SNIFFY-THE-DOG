package com.a407.sniffythedog.application.room.in;

// invitecode ( 쿼리 파라미터에서 가져옴 ) -> RoomDetailResult에 출력
public interface GetRoomByInviteCodeUseCase {
    GetRoomDetailResult getRoomByInviteCode(GetRoomByInviteCodeQuery query);
}
