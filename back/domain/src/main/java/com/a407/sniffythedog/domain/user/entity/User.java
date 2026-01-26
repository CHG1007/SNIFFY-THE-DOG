package com.a407.sniffythedog.domain.user.entity;

import com.a407.sniffythedog.domain.user.enums.SocialProvider;
import com.a407.sniffythedog.domain.user.enums.UserRole;
import com.a407.sniffythedog.domain.user.enums.UserStatus;
import com.a407.sniffythedog.domain.user.exception.UserDomainException;
import com.a407.sniffythedog.domain.user.vo.Nickname;
import com.a407.sniffythedog.domain.user.vo.SocialUuid;
import com.a407.sniffythedog.domain.user.vo.UserId;

import java.time.Instant;
import java.util.Objects;

public class User {

    public static final String ERROR_USER_BANNED = "USER_BANNED";
    public static final String ERROR_USER_DELETED = "USER_DELETED";
    public static final String ERROR_TOKEN_OWNER_MISMATCH = "TOKEN_OWNER_MISMATCH";

    private final UserId id;
    private final SocialProvider socialProvider;
    private final SocialUuid socialUuid;
    private Nickname nickname;
    private UserRole role;
    private UserStatus status;
    private final Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;

    private User(UserId id, SocialProvider socialProvider, SocialUuid socialUuid,
                 Nickname nickname, UserRole role, UserStatus status,
                 Instant createdAt, Instant updatedAt, Instant deletedAt) {
        this.id = id;
        this.socialProvider = Objects.requireNonNull(socialProvider);
        this.socialUuid = Objects.requireNonNull(socialUuid);
        this.nickname = Objects.requireNonNull(nickname);
        this.role = Objects.requireNonNull(role);
        this.status = Objects.requireNonNull(status);
        this.createdAt = Objects.requireNonNull(createdAt);
        this.updatedAt = Objects.requireNonNull(updatedAt);
        this.deletedAt = deletedAt;
    }

    public static User create(SocialProvider socialProvider, SocialUuid socialUuid, Nickname nickname) {
        Instant now = Instant.now();
        return new User(null, socialProvider, socialUuid, nickname, UserRole.USER, UserStatus.ACTIVE, now, now, null);
    }

    public static User reconstitute(UserId id, SocialProvider socialProvider, SocialUuid socialUuid,
                                    Nickname nickname, UserRole role, UserStatus status,
                                    Instant createdAt, Instant updatedAt, Instant deletedAt) {
        return new User(id, socialProvider, socialUuid, nickname, role, status, createdAt, updatedAt, deletedAt);
    }

    public void changeNickname(Nickname newNickname) {
        this.nickname = Objects.requireNonNull(newNickname);
        this.updatedAt = Instant.now();
    }

    public void ban() {
        this.status = UserStatus.BANNED;
        this.updatedAt = Instant.now();
    }

    public void unban() {
        this.status = UserStatus.ACTIVE;
        this.updatedAt = Instant.now();
    }

    public void softDelete() {
        this.deletedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public boolean isActive() {
        return this.status == UserStatus.ACTIVE && this.deletedAt == null;
    }

    public boolean isBanned() {
        return this.status == UserStatus.BANNED;
    }

    public boolean isAdmin() {
        return this.role == UserRole.ADMIN;
    }

    public void validateActive() {
        if (isBanned()) {
            throw new UserDomainException(ERROR_USER_BANNED);
        }
        if (!isActive()) {
            throw new UserDomainException(ERROR_USER_DELETED);
        }
    }

    public void validateTokenOwner(UserId tokenOwnerId) {
        if (tokenOwnerId == null || id == null || !id.equals(tokenOwnerId)) {
            throw new UserDomainException(ERROR_TOKEN_OWNER_MISMATCH);
        }
    }

    // Getters
    public UserId getId() {
        return id;
    }

    public SocialProvider getSocialProvider() {
        return socialProvider;
    }

    public SocialUuid getSocialUuid() {
        return socialUuid;
    }

    public Nickname getNickname() {
        return nickname;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }
}
