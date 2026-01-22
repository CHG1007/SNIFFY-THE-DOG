package com.a407.sniffythedog.application.user.in;

public record GetUserBadgesQuery(Long userId) {

    public static GetUserBadgesQuery of(Long userId) {
        return new GetUserBadgesQuery(userId);
    }
}
