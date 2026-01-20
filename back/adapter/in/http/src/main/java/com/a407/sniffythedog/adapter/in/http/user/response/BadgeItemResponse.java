package com.a407.sniffythedog.adapter.in.http.user.response;

import com.a407.sniffythedog.application.user.in.GetUserBadgesResult;

import java.time.Instant;

public record BadgeItemResponse(
    String code,
    String name,
    String description,
    String condition,
    Instant acquiredAt,
    boolean isNew
) {
    public static BadgeItemResponse from(GetUserBadgesResult.BadgeItem item) {
        return new BadgeItemResponse(
            item.code(),
            item.name(),
            item.description(),
            item.condition(),
            item.acquiredAt(),
            item.isNew()
        );
    }
}
