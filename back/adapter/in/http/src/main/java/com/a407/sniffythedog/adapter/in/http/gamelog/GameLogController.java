package com.a407.sniffythedog.adapter.in.http.gamelog;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.global.security.AuthenticatedUser;
import com.a407.sniffythedog.application.gamelog.GameResultService;
import com.a407.sniffythedog.application.gamelog.in.MyGameLogResult;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gamelog")
@RequiredArgsConstructor
public class GameLogController {

    private final GameResultService gameResultService;

    // 실제 서비스용: 인증된 사용자 ID 사용
    @GetMapping("/{gameHistoryId}")
    public ApiResponse<MyGameLogResult> viewMyAnalysis(
            @PathVariable Long gameHistoryId,
            @AuthenticationPrincipal AuthenticatedUser user) {

        System.out.println("----------------------------------------");
        System.out.println("🔍 [검사 시작] 게임 ID: " + gameHistoryId);
        System.out.println("🆔 [검사 시작] 나의 유저 ID: " + user.userId());
        System.out.println("----------------------------------------");

        MyGameLogResult analysisResult = gameResultService.getMyAnalysis(gameHistoryId, user.userId());
        return ApiResponse.success(analysisResult);
    }

    /**
     * AI 분석 리포트 생성 요청
     * (사용자가 명시적으로 요청하거나, 결과 페이지 진입 시 호출)
     */
    @PostMapping("/{gameHistoryId}/analyze")
    public ApiResponse<String> requestAiAnalysis(@PathVariable Long gameHistoryId) {
        gameResultService.requestAiAnalysis(gameHistoryId);
        return ApiResponse.success("AI 분석이 시작되었습니다.");
    }

    /**
     * 결과 조회 (테스트/내부용)
     */
    @GetMapping("/result/{gameHistoryId}/{userId}")
    public MyGameLogResult viewTestAnalysis(
            @PathVariable Long gameHistoryId,
            @PathVariable Long userId) {
        return gameResultService.getMyAnalysis(gameHistoryId, userId);
    }
}
