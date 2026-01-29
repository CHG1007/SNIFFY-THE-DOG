package com.a407.sniffythedog.adapter.out.openvidu;

import com.a407.sniffythedog.application.media.out.MediaPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class MediaAdapter implements MediaPort {

    private final RestTemplate openViduRestTemplate;
    private final OpenViduConfig openViduConfig;

    @Override
    public String createSession(String sessionId) {
        String url = openViduConfig.getOpenviduUrl() + "/openvidu/api/sessions";

        Map<String, Object> body = new HashMap<>();
        body.put("customSessionId", sessionId);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, openViduConfig.createHeaders());

        try {
            ResponseEntity<Map> response = openViduRestTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            return (String) responseBody.get("sessionId");

        } catch (HttpClientErrorException.Conflict e) {
            // 409 Conflict - 세션이 이미 존재함
            log.debug("Session already exists: {}", sessionId);
            return sessionId;
        }
    }

    @Override
    public String createToken(String sessionId, String userId) {
        String url = openViduConfig.getOpenviduUrl() + "/openvidu/api/sessions/" + sessionId + "/connection";

        Map<String, Object> body = new HashMap<>();
        body.put("data", "{\"userId\":\"" + userId + "\"}");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, openViduConfig.createHeaders());

        ResponseEntity<Map> response = openViduRestTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                Map.class
        );

        Map<String, Object> responseBody = response.getBody();
        return (String) responseBody.get("token");
    }
}
