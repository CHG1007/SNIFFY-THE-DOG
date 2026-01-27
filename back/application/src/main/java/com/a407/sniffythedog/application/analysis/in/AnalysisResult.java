package com.a407.sniffythedog.application.analysis.in;

public class AnalysisResult {
    private final String narrative;
    private final long analyzedAt;

    public AnalysisResult(String narrative, long analyzedAt) {
        this.narrative = narrative;
        this.analyzedAt = analyzedAt;
    }

    public String getNarrative() { return narrative; }
    public long getAnalyzedAt() { return analyzedAt; }
}
