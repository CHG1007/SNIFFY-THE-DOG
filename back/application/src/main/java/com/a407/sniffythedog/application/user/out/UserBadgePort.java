package com.a407.sniffythedog.application.user.out;

import com.a407.sniffythedog.domain.badge.entity.UserBadge;
import com.a407.sniffythedog.domain.user.vo.UserId;

import java.util.List;

public interface UserBadgePort {
    List<UserBadge> findByUserId(UserId userId);
}
