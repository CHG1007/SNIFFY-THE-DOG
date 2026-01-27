package com.a407.sniffythedog.adapter.in.room.request;

public record SetReadyRequest(
        boolean ready,
        String requestId
) {}
