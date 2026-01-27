package com.a407.sniffythedog.adapter.in.common.room.message;

public record Vote2UpdateMessage
        (String type, long version, Long userId, boolean hasVoted) {}
