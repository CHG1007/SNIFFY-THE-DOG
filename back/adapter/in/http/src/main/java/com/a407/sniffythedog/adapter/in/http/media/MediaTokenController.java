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
        long userId = 1L;

        GetMediaTokenQuery query = new GetMediaTokenQuery(roomId, userId);
        GetMediaTokenResult result = getMediaTokenUseCase.getToken(query);

        GetMediaTokenResponse response = new GetMediaTokenResponse(
                result.sessionId(),
                result.token()
        );

        return ApiResponse.success(response);
    }
}
