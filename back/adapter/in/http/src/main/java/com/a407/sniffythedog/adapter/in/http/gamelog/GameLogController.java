package com.a407.sniffythedog.adapter.in.http.gamelog;

import com.a407.sniffythedog.application.gamelog.GameResultService;
import com.a407.sniffythedog.application.gamelog.in.MyGameLogResult;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class GameLogController {

    private final GameResultService gameResultService; // 주입받은 서비스

    // 진짜 코드
    @GetMapping("/{roomId}")
    public String viewMyAnalysis(@PathVariable String roomId, HttpSession session, Model model) {
        // 1. 세션에서 현재 로그인한 유저의 ID를 가져옵니다.
        Long currentUserId = (Long) session.getAttribute("userId");

        // 2. 서비스에게 분석 결과(내 것만 필터링된 가방)를 달라고 합니다.
        // 이 메서드 안에서 몽고DB 조회와 필터링이 모두 일어납니다.
        MyGameLogResult analysisResult = gameResultService.getMyAnalysis(roomId, currentUserId);

        // 3. 서비스가 준 가방을 화면으로 전달합니다.
        model.addAttribute("analysis", analysisResult);
        return "api/v1/mypage/{roomId}/analysis"; // 결과를 보여줄 JSP 파일명
    }

    /**
     * TEST
     * GMS로 전송 -> 저장
     */
    @GetMapping("/start")
    public String triggerAiAnalysis() {
        // 1. 임의의 방 ID를 생성
        String testRoomId = "sniffy-test-" + System.currentTimeMillis();

        // 2. 서비스의 비동기 메서드를 호출
        gameResultService.processGame(testRoomId);

        // 3. 응답 전송
        return "AI Analysis Started! RoomID: " + testRoomId;
    }

    /**
     * TEST
     * MongoDB -> WEB
     */
    @GetMapping("/result/{roomId}/{userId}")
    public MyGameLogResult viewTestAnalysis(
            @PathVariable String roomId,
            @PathVariable Long userId
    ) {
        // 서비스 호출
        return gameResultService.getMyAnalysis(roomId, userId);
    }
}
