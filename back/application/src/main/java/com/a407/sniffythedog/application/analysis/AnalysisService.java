package com.a407.sniffythedog.application.analysis;

import com.a407.sniffythedog.application.analysis.in.AnalysisResult;
import com.a407.sniffythedog.application.analysis.out.GmsPort;
import com.a407.sniffythedog.application.gamelog.out.GameLogRedisPort;
import com.a407.sniffythedog.domain.analysis.entity.AnalysisNarrative;
import com.a407.sniffythedog.domain.analysis.enums.AiModel;
import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalysisService {
    private final GmsPort gmsPort;
    private final GameLogRedisPort gameLogRedisPort;

    public AnalysisResult analyze(String roomId, Long actorId, Long targetId, int round, List<Map<String, Object>> payload) {
        // GMS에 분석 요청
        String text = gmsPort.analyze(AiModel.GPT_5_NANO.getCode(), payload);
        // 분석 결과 -> GameEvent
        GameEvent event = GameEvent.aiAnalysis(round, actorId, targetId, text);
        // redis에 저장
        gameLogRedisPort.saveEvent(roomId, event);
        // front용 결과 반환
        return new AnalysisResult(text, System.currentTimeMillis());
    }
}
