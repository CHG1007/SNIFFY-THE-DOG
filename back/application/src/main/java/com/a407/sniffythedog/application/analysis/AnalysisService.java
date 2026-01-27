package com.a407.sniffythedog.application.analysis;

import com.a407.sniffythedog.application.analysis.in.AnalysisResult;
import com.a407.sniffythedog.application.analysis.out.GmsPort;
import com.a407.sniffythedog.domain.analysis.entity.AnalysisNarrative;
import com.a407.sniffythedog.domain.analysis.enums.AiModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalysisService {
    private final GmsPort gmsPort;

    public AnalysisResult analyze(List<Map<String, Object>> payload) {
        String text = gmsPort.analyze(AiModel.GPT_5_NANO.getCode(), payload);
        return new AnalysisResult(text, System.currentTimeMillis());
    }
}
