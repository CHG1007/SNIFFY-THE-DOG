package com.a407.sniffythedog.adapter.in.http.analysis.response;

public class AnalyzeAnalysisResponse {
    private final String narrative;
    private final long analyzedAt;

    public AnalyzeAnalysisResponse(String narrative, long analyzedAt) {
        this.narrative = narrative;
        this.analyzedAt = analyzedAt;
    }

    public String getNarrative() { return narrative; }
    public long getAnalyzedAt() { return analyzedAt; }
}
