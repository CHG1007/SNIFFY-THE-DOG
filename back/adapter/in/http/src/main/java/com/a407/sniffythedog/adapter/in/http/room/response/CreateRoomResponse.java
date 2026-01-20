package com.a407.sniffythedog.adapter.in.http.room.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreateRoomResponse {
    private String roomId;
    private String inviteCode;
}
