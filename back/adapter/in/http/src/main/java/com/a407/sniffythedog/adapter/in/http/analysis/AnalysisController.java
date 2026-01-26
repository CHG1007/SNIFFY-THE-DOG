package com.a407.sniffythedog.adapter.in.http.analysis;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    @PostMapping("/frames")
    public void receiveFrames(@RequestBody Map<String, Object> body) {
        System.out.println("===== ANALYSIS FRAMES RECEIVED =====");
        System.out.println(body);
    }
}
