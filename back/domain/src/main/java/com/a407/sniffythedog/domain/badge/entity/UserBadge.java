package com.a407.sniffythedog.domain.badge.entity;

import com.a407.sniffythedog.domain.badge.enums.BadgeType;
import com.a407.sniffythedog.domain.badge.vo.UserBadgeId;
import com.a407.sniffythedog.domain.user.vo.UserId;

import java.time.Instant;
import java.util.Objects;

public class UserBadge {

    private final UserBadgeId id;
    private final UserId userId;
    private final BadgeType badgeType;
    private final Instant acquiredAt;
    private boolean isNew;

    private UserBadge(UserBadgeId id, UserId userId, BadgeType badgeType, Instant acquiredAt, boolean isNew) {
        this.id = id;
        this.userId = Objects.requireNonNull(userId, "userId must not be null");
        this.badgeType = Objects.requireNonNull(badgeType, "badgeType must not be null");
        this.acquiredAt = Objects.requireNonNull(acquiredAt, "acquiredAt must not be null");
        this.isNew = isNew;
    }

    public static UserBadge reconstitute(UserBadgeId id, UserId userId, BadgeType badgeType, Instant acquiredAt, boolean isNew) {
        return new UserBadge(id, userId, badgeType, acquiredAt, isNew);
    }

    public void markAsRead() {
        this.isNew = false;
    }

    public UserBadgeId getId() {
        return id;
    }

    public UserId getUserId() {
        return userId;
    }

    public BadgeType getBadgeType() {
        return badgeType;
    }

    public Instant getAcquiredAt() {
        return acquiredAt;
    }

    public boolean isNew() {
        return isNew;
    }
}
