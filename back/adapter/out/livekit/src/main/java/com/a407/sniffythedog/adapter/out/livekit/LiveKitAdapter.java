package com.a407.sniffythedog.adapter.out.livekit;

import com.a407.sniffythedog.application.media.out.MediaPort;
import io.livekit.server.AccessToken;
import io.livekit.server.RoomServiceClient;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.CanPublish;
import io.livekit.server.CanSubscribe;
import io.livekit.server.CanPublishData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import retrofit2.Response;

@Slf4j
@Component
@RequiredArgsConstructor
public class LiveKitAdapter implements MediaPort {

    private final RoomServiceClient roomServiceClient;
    private final LiveKitConfig liveKitConfig;

    @Override
    public String createSession(String sessionId) {
        try {
            // 방 생성은 필수는 아니지만, 기존 플로우와 동일하게 맞추기 위해 생성
            Response<?> response = roomServiceClient.createRoom(sessionId).execute();

            if (!response.isSuccessful()) {
                // 이미 존재하는 경우/정책에 따른 실패 등은 그냥 join 시 자동생성으로 커버 가능
                log.debug("LiveKit createRoom not successful. sessionId={}, code={}", sessionId, response.code());
            }
        } catch (Exception e) {
            // createRoom 실패해도 token 발급 후 최초 join에서 방이 생길 수 있음
            log.debug("LiveKit createRoom failed but will continue. sessionId={}", sessionId, e);
        }
        return sessionId;
    }

    @Override
    public String createToken(String sessionId, String userId) {
        AccessToken token = new AccessToken(liveKitConfig.getApiKey(), liveKitConfig.getApiSecret());

        // identity는 “유저 고유값”으로. name은 화면 표시용(원하면 userId 그대로 써도 됨)
        token.setIdentity(userId);
        token.setName(userId);

        // 해당 room join 권한 + roomName 지정 + publish/subscribe 권한
        token.addGrants(
                new RoomJoin(true),
                new RoomName(sessionId),
                new CanPublish(true),
                new CanSubscribe(true),
                new CanPublishData(true)
        );

        return token.toJwt();
    }
}
