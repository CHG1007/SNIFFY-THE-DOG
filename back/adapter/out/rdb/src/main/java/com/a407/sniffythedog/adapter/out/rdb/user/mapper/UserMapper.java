package com.a407.sniffythedog.adapter.out.rdb.user.mapper;

import com.a407.sniffythedog.adapter.out.rdb.user.entity.UserEntity;
import com.a407.sniffythedog.domain.user.entity.User;
import com.a407.sniffythedog.domain.user.vo.Nickname;
import com.a407.sniffythedog.domain.user.vo.SocialUuid;
import com.a407.sniffythedog.domain.user.vo.UserId;

public class UserMapper {

    private UserMapper() {
    }

    public static UserEntity toEntity(User user) {
        return new UserEntity(
            user.getId() != null ? user.getId().value() : null,
            user.getSocialProvider(),
            user.getSocialUuid().value(),
            user.getNickname().value(),
            user.getRole(),
            user.getStatus(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.getDeletedAt()
        );
    }

    public static User toDomain(UserEntity entity) {
        return User.reconstitute(
            UserId.of(entity.getId()),
            entity.getSocialProvider(),
            SocialUuid.of(entity.getSocialUuid()),
            Nickname.of(entity.getNickname()),
            entity.getRole(),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            entity.getDeletedAt()
        );
    }
}
