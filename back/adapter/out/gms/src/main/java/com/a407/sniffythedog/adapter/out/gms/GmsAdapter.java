package com.a407.sniffythedog.adapter.out.gms;

import com.a407.sniffythedog.application.analysis.out.GmsPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class GmsAdapter implements GmsPort {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gms.base-url}")
    private String baseUrl;

    @Value("${gms.chat-completions-path}")
    private String path;

    @Value("${gms.api-key}")
    private String apiKey;

    @Override
    public String analyze(String modelName, List<Map<String, Object>> payload) {
        String url = baseUrl + path;

        Map<String, Object> body = Map.of(
                "model", modelName,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                """ 
                                너는 한국어를 사용하는 감정 분석가이며,
                                다음은 5초간 수집된 사용자 감정 데이터이다.
                                이 데이터를 기반으로 현재 사용자의 감정 상태 및 긴장도를 한 문장으로 요약하라."""),
                        Map.of("role", "user", "content", "분석 데이터: " + (payload != null ? payload.toString() : "전달된 데이터가 없습니다."))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
        return extractText(response.getBody());
    }

    private String extractText(Map response) {
        try {
            List<Map> choices = (List<Map>) response.get("choices");
            Map message = (Map) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "분석 결과 요약 실패";
        }
    }
}
