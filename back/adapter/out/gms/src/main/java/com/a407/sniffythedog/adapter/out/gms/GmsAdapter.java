package com.a407.sniffythedog.adapter.out.gms;

import com.a407.sniffythedog.application.analysis.out.GmsPort;
import com.a407.sniffythedog.application.gamelog.out.GameLogGmsPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Component
public class GmsAdapter implements GmsPort, GameLogGmsPort {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gms.base-url}")
    private String baseUrl;

    @Value("${gms.chat-completions-path}")
    private String path;

    @Value("${gms.api-key}")
    private String apiKey;

    // 감정 분석
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

    //
    @Override
    public String generateReport(List<String> playerInfos, List<String> eventTexts) {
        String url = baseUrl + path;

        // 1. 어댑터 내부에서 AI에게 시킬 명령(프롬프트)을 생성합니다.
        // AI에게 전체 요약 1문장과 플레이어별 활약상을 JSON 형식으로 달라고 명령합니다.
        String prompt = "너는 마피아 게임 분석 전문가야. 아래 로그를 읽고 다음 JSON 형식으로만 응답해.\n" +
                "{\n" +
                "  \"totalSummary\": \"게임 전체 흐름 요약(세 문장)\",\n" +
                "  \"playerReports\": {\n" +
                "    \"유저ID\": \"해당 유저만의 개인 활약상 두 문장\"\n" +
                "  }\n" +
                "}\n" +
                "분석 대상 플레이어(ID:닉네임:역할): " + String.join(", ", playerInfos);

        // 2. OpenAI 규격에 맞는 요청 바디(Body)를 구성합니다.
        Map<String, Object> body = Map.of(
                "model", "gpt-5-mini",
                "messages", List.of(
                        Map.of("role", "system", "content", prompt),
                        Map.of("role", "user", "content", "게임 로그 데이터: " + eventTexts.toString())
                )
        );

        // 3. HTTP 헤더 설정 (JSON 타입 및 API 키 인증)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // 4. AI 서버에 HTTP POST 요청
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    url,
                    new HttpEntity<>(body, headers),
                    Map.class
            );
            return extractText(Objects.requireNonNull(response.getBody()));
        } catch (Exception e) {
            // 통신 실패 시 JSON 형태를 반환
            return "{}";
        }
    }

    // 결과 추출
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
