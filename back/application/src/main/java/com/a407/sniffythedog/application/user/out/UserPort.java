package com.a407.sniffythedog.application.user.out;

import com.a407.sniffythedog.domain.user.entity.User;
import com.a407.sniffythedog.domain.user.vo.UserId;

import java.util.Map;
import java.util.Set;

public interface UserPort {
    Map<UserId, User> findByIds(Set<UserId> userIds);

    User findById(UserId userId);
}
