package com.a407.sniffythedog.adapter.in.http.admin.response;

import com.a407.sniffythedog.application.user.in.AdminUserListResult;
import java.util.List;

public record AdminUserListResponse(
    List<AdminUserResponseItem> users
) {
    public static AdminUserListResponse from(AdminUserListResult result) {
        return new AdminUserListResponse(
            result.users().stream()
                .map(item -> new AdminUserResponseItem(
                    item.userId(),
                    item.nickname(),
                    item.socialProvider(),
                    item.role(),
                    item.status(),
                    item.createdAt(),
                    item.updatedAt()
                ))
                .toList()
        );
    }
}
