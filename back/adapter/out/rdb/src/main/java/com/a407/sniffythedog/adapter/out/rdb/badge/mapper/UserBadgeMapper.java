package com.a407.sniffythedog.adapter.out.rdb.badge.mapper;

import com.a407.sniffythedog.adapter.out.rdb.badge.entity.UserBadgeEntity;
import com.a407.sniffythedog.domain.badge.entity.UserBadge;
import com.a407.sniffythedog.domain.badge.vo.UserBadgeId;
import com.a407.sniffythedog.domain.user.vo.UserId;

public class UserBadgeMapper {

    private UserBadgeMapper() {
    }

    public static UserBadge toDomain(UserBadgeEntity entity) {
        return UserBadge.reconstitute(
            UserBadgeId.of(entity.getId()),
            UserId.of(entity.getUserId()),
            entity.getBadgeType(),
            entity.getAcquiredAt(),
            entity.isNew()
        );
    }
}
