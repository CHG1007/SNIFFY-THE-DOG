package com.a407.sniffythedog.adapter.in.http.user.response;

import com.a407.sniffythedog.application.user.in.GetUserBadgesResult;

import java.util.List;

public record GetUserBadgesResponse(
    List<BadgeItemResponse> badges
) {
    public static GetUserBadgesResponse from(GetUserBadgesResult result) {
        List<BadgeItemResponse> badges = result.badges().stream()
            .map(BadgeItemResponse::from)
            .toList();
        return new GetUserBadgesResponse(badges);
    }
}
