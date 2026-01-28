package com.a407.sniffythedog.adapter.out.livekit;

import io.livekit.server.RoomServiceClient;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class LiveKitConfig {

    @Value("${livekit.url}")
    private String livekitUrl;

    @Value("${livekit.api-key}")
    private String apiKey;

    @Value("${livekit.api-secret}")
    private String apiSecret;

    @Bean
    public RoomServiceClient liveKitRoomServiceClient() {
        return RoomServiceClient.createClient(livekitUrl, apiKey, apiSecret);
    }
}
