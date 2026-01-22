package com.a407.sniffythedog.adapter.in.http.room.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RoomSummaryResponse {
    private String roomId;
    private String title;
    private int currentCount;
    private int capacity;
    private boolean isPrivate;

}

