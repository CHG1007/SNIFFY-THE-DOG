package com.a407.sniffythedog.adapter.in.http.analysis.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class AnalyzeAnalysisRequest {
    private String roomId; // 방
    private Long actorUserId; // 분석 버튼 누른 사람
    private Long targetUserId; // 분석 대상
    private int round; // 라운드
    private List<Map<String, Object>> frames; // 5초간의 상세 데이터 리스트

    public AnalyzeAnalysisRequest() {}
    public List<Map<String, Object>> getPayload() { return frames; }
}