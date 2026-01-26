package com.a407.sniffythedog.application.media;

import com.a407.sniffythedog.application.media.in.GetMediaTokenQuery;
import com.a407.sniffythedog.application.media.in.GetMediaTokenResult;
import com.a407.sniffythedog.application.media.in.GetMediaTokenUseCase;
import com.a407.sniffythedog.application.media.out.OpenViduPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MediaService implements GetMediaTokenUseCase {

    private final OpenViduPort openViduPort;

    @Override
    public GetMediaTokenResult getToken(GetMediaTokenQuery query) {
        String sessionId = openViduPort.createSession(query.roomId());
        String token = openViduPort.createToken(sessionId, query.userId());

        return new GetMediaTokenResult(sessionId, token);
    }
}
