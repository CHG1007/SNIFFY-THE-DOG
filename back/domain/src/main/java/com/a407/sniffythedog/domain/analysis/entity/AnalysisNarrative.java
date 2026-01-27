package com.a407.sniffythedog.domain.analysis.entity;

public class AnalysisNarrative {

    private final String narrative;   // GMS가 준 문장 그대로
    private final long analyzedAt;     // 분석 시점

    // 1. 직접 만든 생성자 (AllArgsConstructor 대체)
    public AnalysisNarrative(String narrative, long analyzedAt) {
        this.narrative = narrative;
        this.analyzedAt = analyzedAt;
    }

    // 2. 직접 만든 Getter (Getter 대체)
    public String getNarrative() {
        return narrative;
    }

    public long getAnalyzedAt() {
        return analyzedAt;
    }
}