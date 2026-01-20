package com.a407.sniffythedog.adapter.in.http.user;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.user.request.ChangeNicknameRequest;
import com.a407.sniffythedog.adapter.in.http.user.response.GetMyInfoResponse;
import com.a407.sniffythedog.application.user.in.ChangeNicknameCommand;
import com.a407.sniffythedog.application.user.in.ChangeNicknameUseCase;
import com.a407.sniffythedog.application.user.in.GetMyInfoResult;
import com.a407.sniffythedog.application.user.in.GetMyInfoUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final GetMyInfoUseCase getMyInfoUseCase;
    private final ChangeNicknameUseCase changeNicknameUseCase;

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

    @PutMapping("/api/users/me/nickname")
    public ApiResponse<GetMyInfoResponse> changeNickname(
        @Valid @RequestBody ChangeNicknameRequest request
        // TODO: @AuthenticationPrincipal 로 현재 로그인 사용자 ID 주입
    ) {
        // TODO: 실제 로그인 사용자 ID로 교체 필요
        Long userId = 1L;

        ChangeNicknameCommand command = new ChangeNicknameCommand(userId, request.nickname());
        GetMyInfoResult result = changeNicknameUseCase.execute(command);

        return ApiResponse.success(GetMyInfoResponse.from(result));
    }
}
