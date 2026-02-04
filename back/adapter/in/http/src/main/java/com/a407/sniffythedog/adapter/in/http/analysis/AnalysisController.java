package com.a407.sniffythedog.adapter.in.http.analysis;

import com.a407.sniffythedog.adapter.in.http.analysis.request.AnalyzeAnalysisRequest;
import com.a407.sniffythedog.adapter.in.http.analysis.response.AnalyzeAnalysisResponse;
import com.a407.sniffythedog.application.analysis.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalysisController {
    private final AnalysisService analysisService;

    @PostMapping("/frames")
    public ResponseEntity<AnalyzeAnalysisResponse> analyze(@RequestBody AnalyzeAnalysisRequest request) {
        // 1. 서비스에게 주방 쟁반(DTO)을 받는다
        System.out.println("받은 방 ID: " + request.getRoomId());
        System.out.println("받은 방 ID: " + request.getActorUserId());
        System.out.println("받은 방 ID: " + request.getTargetUserId());
        System.out.println("받은 방 ID: " + request.getRound());

        var resultDto = analysisService.analyze(
                request.getRoomId(),
                request.getActorUserId(),
                request.getTargetUserId(),
                request.getRound(),
                request.getPayload());

        // 2. 컨트롤러가 자기 접시(Response)로 옮겨 담는다
        return ResponseEntity.ok(new AnalyzeAnalysisResponse(
                resultDto.getNarrative(),
                resultDto.getAnalyzedAt()
        ));
    }
}
