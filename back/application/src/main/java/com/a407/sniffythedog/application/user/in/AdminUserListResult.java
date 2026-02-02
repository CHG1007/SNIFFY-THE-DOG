package com.a407.sniffythedog.application.user.in;

import java.util.List;

public record AdminUserListResult(
    List<AdminUserResult> users
) {
}
