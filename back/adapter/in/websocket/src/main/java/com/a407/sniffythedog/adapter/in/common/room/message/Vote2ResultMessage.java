package com.a407.sniffythedog.adapter.in.common.room.message;

public record Vote2ResultMessage(
        String type,
        long version,
        boolean approved,
        Long executedUserId,
        long agree,
        long disagree
) {}
