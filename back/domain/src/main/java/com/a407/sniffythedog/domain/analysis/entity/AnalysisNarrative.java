package com.a407.sniffythedog.domain.analysis.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AnalysisNarrative {

    private final String narrative;   // GMS가 준 문장 그대로
    private final long analyzedAt;     // 분석 시점
}
