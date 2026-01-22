package com.a407.sniffythedog.adapter.in.http.user.response;

import com.a407.sniffythedog.application.user.in.GetMyInfoResult;

import java.time.Instant;

public record GetMyInfoResponse(
    Long userId,
    String nickname,
    String socialProvider,
    String role,
    String status,
    Instant createdAt
) {
    public static GetMyInfoResponse from(GetMyInfoResult result) {
        return new GetMyInfoResponse(
            result.userId(),
            result.nickname(),
            result.socialProvider(),
            result.role(),
            result.status(),
            result.createdAt()
        );
    }
}