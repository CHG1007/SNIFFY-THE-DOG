package com.a407.sniffythedog.adapter.out.rdb.user.entity;

import com.a407.sniffythedog.domain.user.enums.SocialProvider;
import com.a407.sniffythedog.domain.user.enums.UserRole;
import com.a407.sniffythedog.domain.user.enums.UserStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "social_provider", nullable = false)
    private SocialProvider socialProvider;

    @Column(name = "social_uuid", nullable = false)
    private String socialUuid;

    @Column(name = "nickname", nullable = false, unique = true)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    protected UserEntity() {
    }

    public UserEntity(Long id, SocialProvider socialProvider, String socialUuid,
                      String nickname, UserRole role, UserStatus status,
                      Instant createdAt, Instant updatedAt, Instant deletedAt) {
        this.id = id;
        this.socialProvider = socialProvider;
        this.socialUuid = socialUuid;
        this.nickname = nickname;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    public Long getId() {
        return id;
    }

    public SocialProvider getSocialProvider() {
        return socialProvider;
    }

    public String getSocialUuid() {
        return socialUuid;
    }

    public String getNickname() {
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
