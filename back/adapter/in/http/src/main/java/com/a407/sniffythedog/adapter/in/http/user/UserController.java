package com.a407.sniffythedog.adapter.in.http.user;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.user.response.GetMyInfoResponse;
import com.a407.sniffythedog.application.user.in.GetMyInfoResult;
import com.a407.sniffythedog.application.user.in.GetMyInfoUseCase;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    private final GetMyInfoUseCase getMyInfoUseCase;

    public UserController(GetMyInfoUseCase getMyInfoUseCase) {
        this.getMyInfoUseCase = getMyInfoUseCase;
    }

    @GetMapping("/api/users/me")
    public ApiResponse<GetMyInfoResponse> getMyInfo(
        // TODO: @AuthenticationPrincipal 로 현재 로그인 사용자 ID 주입
    ) {
        // TODO: 실제 로그인 사용자 ID로 교체 필요
        Long userId = 1L;

        GetMyInfoResult result = getMyInfoUseCase.execute(userId);
        GetMyInfoResponse response = GetMyInfoResponse.from(result);

        return ApiResponse.success(response);
    }
}