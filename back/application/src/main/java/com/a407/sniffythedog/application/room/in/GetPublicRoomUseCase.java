package com.a407.sniffythedog.application.room.in;

public interface GetPublicRoomUseCase {
    GetPublicRoomsPageResult getPublicRooms(int page, int size);
}
