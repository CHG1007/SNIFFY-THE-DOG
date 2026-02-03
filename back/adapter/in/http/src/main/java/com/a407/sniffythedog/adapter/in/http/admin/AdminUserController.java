package com.a407.sniffythedog.adapter.in.http.admin;

import com.a407.sniffythedog.adapter.in.http.admin.response.AdminUserListResponse;
import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.application.user.in.AdminUserListResult;
import com.a407.sniffythedog.application.user.in.AdminUserUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserUseCase adminUserUseCase;

    @GetMapping("/api/v1/admin/users")
    public ApiResponse<AdminUserListResponse> getAllUsers() {
        AdminUserListResult result = adminUserUseCase.getAllUsers();
        return ApiResponse.success(AdminUserListResponse.from(result));
    }
}
