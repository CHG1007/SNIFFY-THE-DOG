package com.a407.sniffythedog.application.media;

import com.a407.sniffythedog.application.media.in.GetMediaTokenQuery;
import com.a407.sniffythedog.application.media.in.GetMediaTokenResult;
import com.a407.sniffythedog.application.media.in.GetMediaTokenUseCase;
import com.a407.sniffythedog.application.media.out.MediaPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MediaService implements GetMediaTokenUseCase {

    private final MediaPort mediaPort;

    @Override
    public GetMediaTokenResult getToken(GetMediaTokenQuery query) {
        String sessionId = mediaPort.createSession(query.roomId());
        String token = mediaPort.createToken(sessionId, String.valueOf(query.userId()));

        return new GetMediaTokenResult(sessionId, token);
    }
}
