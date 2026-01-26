package com.a407.sniffythedog.adapter.in.http.analysis;

import com.a407.sniffythedog.application.analysis.AnalysisService;
import com.a407.sniffythedog.domain.analysis.entity.AnalysisNarrative;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 프론트엔드 연동을 위한 CORS 허용
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/frames")
    public ResponseEntity<AnalysisNarrative> analyze(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(analysisService.analyze(payload));
    }
}
