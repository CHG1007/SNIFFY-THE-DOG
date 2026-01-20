package com.a407.sniffythedog.application.user.in;

import java.time.Instant;
import java.util.List;

public record GetUserBadgesResult(
    List<BadgeItem> badges
) {
    public record BadgeItem(
        String code,
        String name,
        String description,
        String condition,
        Instant acquiredAt,
        boolean isNew
    ) {}
}
