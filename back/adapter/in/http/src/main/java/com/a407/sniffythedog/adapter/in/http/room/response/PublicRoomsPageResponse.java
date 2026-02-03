package com.a407.sniffythedog.adapter.in.http.room.response;

import com.a407.sniffythedog.application.common.PageInfo;

import java.util.List;

public record PublicRoomsPageResponse(
    List<RoomSummaryResponse> rooms,
    PageInfo pageInfo
) {
}
