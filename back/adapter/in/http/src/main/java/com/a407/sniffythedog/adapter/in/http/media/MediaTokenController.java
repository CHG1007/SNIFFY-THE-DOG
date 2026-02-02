package com.a407.sniffythedog.adapter.in.http.media;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.media.response.GetMediaTokenResponse;
import com.a407.sniffythedog.application.media.in.GetMediaTokenQuery;
import com.a407.sniffythedog.application.media.in.GetMediaTokenResult;
import com.a407.sniffythedog.application.media.in.GetMediaTokenUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/media")
public class MediaTokenController {

    private final GetMediaTokenUseCase getMediaTokenUseCase;

    @GetMapping("/token")
    public ApiResponse<GetMediaTokenResponse> getToken(@RequestParam String roomId) {
        // TODO: 인증 구현 후 @Authentication에서 userId 추출
        // 테스트용: 랜덤 userId 생성 (실제로는 인증된 사용자 ID 사용)
        long userId = System.currentTimeMillis() % 1000000;

        GetMediaTokenQuery query = new GetMediaTokenQuery(roomId, userId);
        GetMediaTokenResult result = getMediaTokenUseCase.getToken(query);

        GetMediaTokenResponse response = new GetMediaTokenResponse(
                result.sessionId(),
                result.token()
        );

        return ApiResponse.success(response);
    }
}
