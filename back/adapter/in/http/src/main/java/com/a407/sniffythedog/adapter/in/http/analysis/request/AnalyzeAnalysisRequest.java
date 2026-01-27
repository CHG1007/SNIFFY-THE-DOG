package com.a407.sniffythedog.adapter.in.http.analysis.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class AnalyzeAnalysisRequest {
    private List<Map<String, Object>> frames;

    public AnalyzeAnalysisRequest() {}
    public List<Map<String, Object>> getPayload() { return frames; }
}