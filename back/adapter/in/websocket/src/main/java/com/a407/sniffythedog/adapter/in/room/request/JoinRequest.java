package com.a407.sniffythedog.adapter.in.room.request;

public record JoinRequest(
        String nickname,
        String clientType,
        String requestId
) {
}
