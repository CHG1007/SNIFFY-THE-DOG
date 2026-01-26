package com.a407.sniffythedog.application.analysis;

import com.a407.sniffythedog.application.analysis.out.GmsPort;
import com.a407.sniffythedog.domain.analysis.entity.AnalysisNarrative;
import com.a407.sniffythedog.domain.analysis.enums.AiModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalysisService {
    private final GmsPort gmsPort;

    public AnalysisNarrative analyze(Map<String, Object> payload) {
        // GMS로부터 분석된 텍스트 수신
        String text = gmsPort.analyze(AiModel.GPT_5_NANO, payload);

        // 프론트엔드에 전달할 객체 생성
        return new AnalysisNarrative(text, System.currentTimeMillis());
    }
}
