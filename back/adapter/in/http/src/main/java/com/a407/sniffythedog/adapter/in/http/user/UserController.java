package com.a407.sniffythedog.adapter.in.http.user;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.common.response.PageResponse;
import com.a407.sniffythedog.adapter.in.http.global.security.AuthenticatedUser;
import com.a407.sniffythedog.adapter.in.http.user.request.ChangeNicknameRequest;
import com.a407.sniffythedog.adapter.in.http.user.request.GetUserGameHistoryRequest;
import com.a407.sniffythedog.adapter.in.http.user.response.GameHistoryItemResponse;
import com.a407.sniffythedog.adapter.in.http.user.response.GetMyInfoResponse;
import com.a407.sniffythedog.adapter.in.http.user.response.GetUserBadgesResponse;
import com.a407.sniffythedog.application.user.in.ChangeNicknameCommand;
import com.a407.sniffythedog.application.user.in.ChangeNicknameUseCase;
import com.a407.sniffythedog.application.user.in.GetMyInfoResult;
import com.a407.sniffythedog.application.user.in.GetMyInfoUseCase;
import com.a407.sniffythedog.application.user.in.GetUserBadgesQuery;
import com.a407.sniffythedog.application.user.in.GetUserBadgesResult;
import com.a407.sniffythedog.application.user.in.GetUserBadgesUseCase;
import com.a407.sniffythedog.application.user.in.GetUserGameHistoryResult;
import com.a407.sniffythedog.application.user.in.GetUserGameHistoryUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final GetMyInfoUseCase getMyInfoUseCase;
    private final ChangeNicknameUseCase changeNicknameUseCase;
    private final GetUserGameHistoryUseCase getUserGameHistoryUseCase;
    private final GetUserBadgesUseCase getUserBadgesUseCase;

    @GetMapping("/api/users/me")
    public ApiResponse<GetMyInfoResponse> getMyInfo(
            @AuthenticationPrincipal AuthenticatedUser user) {
        GetMyInfoResult result = getMyInfoUseCase.execute(user.userId());
        GetMyInfoResponse response = GetMyInfoResponse.from(result);

        return ApiResponse.success(response);
    }

    @PutMapping("/api/users/me/nickname")
    public ApiResponse<GetMyInfoResponse> changeNickname(
            @Valid @RequestBody ChangeNicknameRequest request,
            @AuthenticationPrincipal AuthenticatedUser user) {
        ChangeNicknameCommand command = new ChangeNicknameCommand(user.userId(), request.nickname());
        GetMyInfoResult result = changeNicknameUseCase.execute(command);

        return ApiResponse.success(GetMyInfoResponse.from(result));
    }

    @GetMapping("/api/users/me/games")
    public ApiResponse<PageResponse<GameHistoryItemResponse>> getUserGameHistory(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection,
            @AuthenticationPrincipal AuthenticatedUser user) {
        GetUserGameHistoryRequest request = new GetUserGameHistoryRequest(page, size, sortBy, sortDirection);
        GetUserGameHistoryResult result = getUserGameHistoryUseCase.execute(request.toQuery(user.userId()));

        List<GameHistoryItemResponse> items = result.games().stream()
                .map(GameHistoryItemResponse::from)
                .toList();

        PageResponse<GameHistoryItemResponse> pageResponse = PageResponse.of(items, result.pageInfo());

        return ApiResponse.success(pageResponse);
    }

    @GetMapping("/api/users/me/badges")
    public ApiResponse<GetUserBadgesResponse> getUserBadges(
            @AuthenticationPrincipal AuthenticatedUser user) {
        GetUserBadgesResult result = getUserBadgesUseCase.execute(GetUserBadgesQuery.of(user.userId()));

        return ApiResponse.success(GetUserBadgesResponse.from(result));
    }
}
