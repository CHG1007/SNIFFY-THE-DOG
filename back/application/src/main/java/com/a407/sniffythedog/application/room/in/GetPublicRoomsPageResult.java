package com.a407.sniffythedog.application.room.in;

import com.a407.sniffythedog.application.common.PageInfo;

import java.util.List;

public record GetPublicRoomsPageResult(
    List<GetPublicRoomResult> rooms,
    PageInfo pageInfo
) {
}
