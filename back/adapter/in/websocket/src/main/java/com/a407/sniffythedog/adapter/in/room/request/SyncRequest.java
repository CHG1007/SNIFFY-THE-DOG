package com.a407.sniffythedog.adapter.in.room.request;

public record SyncRequest(
        String requestId,
        int lastKnownVersion
) {
}
