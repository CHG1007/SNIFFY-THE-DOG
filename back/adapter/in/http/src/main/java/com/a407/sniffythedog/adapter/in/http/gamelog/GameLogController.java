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
    @GetMapping("/{roomId}")
    public ApiResponse<MyGameLogResult> viewMyAnalysis(
            @PathVariable String roomId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        MyGameLogResult analysisResult = gameResultService.getMyAnalysis(roomId, user.userId());
        return ApiResponse.success(analysisResult);
    }

    /**
     * TEST
     * GMS로 전송 -> 저장
     */
    @GetMapping("/start")
    public String triggerAiAnalysis() {
        String testRoomId = "sniffy-test-" + System.currentTimeMillis();
        gameResultService.processGame(testRoomId);
        return "AI Analysis Started! RoomID: " + testRoomId;
    }

    /**
     * TEST
     * MongoDB -> WEB
     * (테스트용은 유지하되, 필요 시 삭제 가능)
     */
    @GetMapping("/result/{roomId}/{userId}")
    public MyGameLogResult viewTestAnalysis(
            @PathVariable String roomId,
            @PathVariable Long userId) {
        return gameResultService.getMyAnalysis(roomId, userId);
    }
}
