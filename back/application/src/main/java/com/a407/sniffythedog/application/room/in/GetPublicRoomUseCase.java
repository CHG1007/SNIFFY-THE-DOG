package com.a407.sniffythedog.application.room.in;

import java.util.List;

public interface GetPublicRoomUseCase {
    List<GetPublicRoomResult> getPublicRooms(int page, int size);
}
