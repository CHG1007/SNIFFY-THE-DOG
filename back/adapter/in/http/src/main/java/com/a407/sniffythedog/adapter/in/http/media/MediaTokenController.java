package com.a407.sniffythedog.adapter.in.http.media;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.media.request.GetMediaTokenRequest;
import com.a407.sniffythedog.adapter.in.http.media.response.GetMediaTokenResponse;
import com.a407.sniffythedog.application.media.in.GetMediaTokenQuery;
import com.a407.sniffythedog.application.media.in.GetMediaTokenResult;
import com.a407.sniffythedog.application.media.in.GetMediaTokenUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/media")
public class MediaTokenController {

    private final GetMediaTokenUseCase getMediaTokenUseCase;

    @PostMapping("/token")
    public ApiResponse<GetMediaTokenResponse> getToken(@RequestBody @Valid GetMediaTokenRequest request) {
        GetMediaTokenQuery query = new GetMediaTokenQuery(
                request.getRoomId(),
                request.getUserId()
        );

        GetMediaTokenResult result = getMediaTokenUseCase.getToken(query);

        GetMediaTokenResponse response = new GetMediaTokenResponse(
                result.sessionId(),
                result.token()
        );

        return ApiResponse.success(response);
    }
}
