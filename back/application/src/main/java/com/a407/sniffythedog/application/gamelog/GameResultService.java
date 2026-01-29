package com.a407.sniffythedog.application.gamelog;

import com.a407.sniffythedog.application.gamelog.in.MyGameLogResult;
import com.a407.sniffythedog.application.gamelog.out.GameLogRedisPort;
import com.a407.sniffythedog.application.gamelog.out.GameLogGmsPort;
import com.a407.sniffythedog.application.gamelog.out.GameLogPort;
import com.a407.sniffythedog.domain.game.enums.GameRole;
import com.a407.sniffythedog.domain.gamelog.entity.GameLog;
import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import com.a407.sniffythedog.domain.gamelog.vo.PlayerResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GameResultService {
    private final GameLogPort gameLogPort; // MongoDB 저장
    private final GameLogRedisPort gameLogRedisPort; // Redis 로그 수집
    private final ObjectMapper objectMapper; // JSON 해석
    private final GameLogGmsPort gameLogGmsPort; // AI 분석

    @Async // 비동기로 백그라운드에서 실행합니다.
    public void processGameResult(String roomId) {
        // 1. Redis에서 방 정보(Player 목록 + 이벤트 목록) 가져오기
        GameLog gameLog = gameLogRedisPort.loadGameLog(roomId)
                .orElseThrow(() -> new RuntimeException("해당 방의 게임 로그를 찾을 수 없습니다: " + roomId));

        // 2. AI 리포트가 아직 없는 순수 로그 상태를 mongoDB에 저장
        gameLogPort.save(gameLog);

        // 3. AI 분석을 위한 재료 준비 (문자열 리스트 변환)
        List<String> playerInfos = gameLog.getPlayers().stream()
                .map(p -> p.odUserId() + ":" + p.odNickname() + ":" + p.role().name())
                .toList();

        List<String> eventTexts = gameLog.getEvents().stream()
                .map(e -> String.format("[%d라운드] %s 발생", e.round(), e.type().name()))
                .toList();

        // 4. AI 통합 분석 요청
        String jsonResponse = gameLogGmsPort.generateReport(playerInfos, eventTexts);

        // 5. AI가 준 결과를 해석해서 도메인 객체에 채우기
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);

            // 전체 요약 저장
            gameLog.updateTotalSummary(root.path("totalSummary").asText());

            // 유저 ID별로 활약상 쪼개서 Map에 넣기
            JsonNode reports = root.path("playerReports");
            gameLog.getPlayers().forEach(p -> {
                String personalReport = reports.path(String.valueOf(p.odUserId())).asText();
                gameLog.addAiReport(p.odUserId(), personalReport);
            });
        } catch (Exception e) {
            gameLog.updateTotalSummary("AI 분석 결과 해석 실패");
        }

        // 6. AI 리포트가 채워진 최종본을 MongoDB에 다시 저장(업데이트)합니다.
        gameLogPort.save(gameLog);

        // 7. 모든 저장이 끝났으므로 Redis 임시 로그 삭제
        gameLogRedisPort.deleteGameLog(roomId);
    }


    public MyGameLogResult getMyAnalysis(String roomId, Long userId) {
        // 1. 몽고DB에서 룸 ID로 게임 로그를 찾습니다.
        GameLog gameLog = gameLogPort.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("게임 로그를 찾을 수 없습니다."));

        // 2. 전체 요약 가져오기
        String totalSummary = gameLog.getTotalSummary();

        // 3. 참여자 중 '나'를 찾아서 내 리포트만 가져오기
        String myReport = gameLog.getPlayers().stream()
                .filter(p -> p.odUserId().equals(userId))
                .map(p -> gameLog.getAiReports().getOrDefault(p.odUserId(), "분석 결과가 없습니다."))
                .findFirst()
                .orElse("데이터를 분석 중이거나 결과가 없습니다.");

        return new MyGameLogResult(totalSummary, myReport);
    }

    /**
     * TEST
     *
     * 가짜 데이터
     */
    @Async
    public void processGame(String roomId) {
        System.out.println("==== [풍성한 데이터 테스트] AI 분석 시작 (Room: " + roomId + ") ====");

        try {
            // 1. 참여자 명단 (각 역할별로 뚜렷한 개성 부여)
            List<PlayerResult> fakePlayers = List.of(
                    PlayerResult.of(1L, "지영", GameRole.MAFIA, true),    // 승리한 마피아
                    PlayerResult.of(2L, "철수", GameRole.POLICE, false),  // 수사하다 전사한 경찰
                    PlayerResult.of(3L, "영희", GameRole.DOCTOR, true),   // 끝까지 살아남은 의사
                    PlayerResult.of(4L, "민수", GameRole.CITIZEN, false)  // 억울하게 희생된 시민
            );

            GameLog gameLog = GameLog.create(roomId, fakePlayers, java.time.Instant.now());

            // 2. AI 분석 재료 준비
            List<String> playerInfos = gameLog.getPlayers().stream()
                    .map(p -> p.odUserId() + ":" + p.odNickname() + ":" + p.role().name())
                    .toList();

            // 3. 각 플레이어당 5개 이상의 데이터가 포함된 상세 로그
            List<GameEvent> fakeEvents = List.of(
                    // 1라운드: 민수의 죽음
                    GameEvent.mafiaTarget(1, 4L),        // [지영/행동] 민수 타겟팅
                    GameEvent.policeCheck(1, 2L, 1L, true),    // [철수/행동] 지영 조사 (실패 혹은 미확신)
                    GameEvent.doctorSave(1, 3L, 3L),     // [영희/행동] 자기 자신 치료
                    GameEvent.kill(1, 4L),               // [민수/사건] 마피아에게 살해당함
                    GameEvent.dayVote(1, 4L, 1L),        // [민수/최후] 죽기 전 지영 투표

                    // 2라운드: 지영의 여론 조작
                    GameEvent.policeCheck(2, 2L, 3L, false),    // [철수/행동] 영희 조사 (시민팀 확인)
                    GameEvent.dayVote(2, 1L, 2L),        // [지영/행동] 철수를 마피아로 몰며 투표
                    GameEvent.dayVote(2, 3L, 1L),        // [영희/행동] 지영을 의심하며 투표
                    GameEvent.finalVote(2, 3L, false),   // [영희/행동] 철수 처형 반대 (철수 방어)
                    GameEvent.dayVote(2, 2L, 1L),        // [철수/행동] 지영이 범인이라고 주장

                    // 3라운드: 결정적 증거와 암살
                    GameEvent.policeCheck(3, 2L, 1L, false),    // [철수/행동] 지영이 마피아임을 확신
                    GameEvent.mafiaTarget(3, 2L),        // [지영/행동] 위협적인 경찰 철수 제거 타겟
                    GameEvent.kill(3, 2L),               // [철수/사건] 밤에 지영에게 암살됨
                    GameEvent.doctorSave(3, 3L, 2L),     // [영희/행동] 철수를 살리려 했으나 실패
                    GameEvent.dayVote(3, 3L, 1L),        // [영희/행동] 혼자 남은 두려움에 지영 투표

                    // 최종 라운드: 마피아 승리
                    GameEvent.mafiaTarget(4, 3L),        // [지영/행동] 마지막 생존자 영희 타겟
                    GameEvent.kill(4, 3L),               // [지영/행동] 영희 살해
                    GameEvent.finalVote(4, 1L, true),    // [지영/결과] 승리의 찬성표
                    GameEvent.execute(4, 3L),            // [영희/사건] 마지막 시민 처형 혹은 사망
                    GameEvent.dayVote(4, 1L, 3L)         // [지영/평가] 완벽한 마무리
            );

            List<String> eventText = fakeEvents.stream()
                    .map(e -> String.format("[%d라운드] %s 발생", e.round(), e.type().name()))
                    .toList();

            System.out.println("3. AI(GMS)에게 보낼 재료 변환 완료 (개수: " + eventText.size() + ")");

            System.out.println("3. AI(GMS)에게 1인당 5개 이상의 정밀 데이터를 보냅니다.");
            String jsonResponse = gameLogGmsPort.generateReport(playerInfos, eventText);

            try {
                JsonNode root = objectMapper.readTree(jsonResponse);
                gameLog.updateTotalSummary(root.path("totalSummary").asText());

                JsonNode reports = root.path("playerReports");
                gameLog.getPlayers().forEach(p -> {
                    String personalReport = reports.path(String.valueOf(p.odUserId())).asText();
                    gameLog.addAiReport(p.odUserId(), personalReport);
                });

                // 📍 진짜로 창고(MongoDB)에 넣기!
                gameLogPort.save(gameLog);
                System.out.println("4. AI 정밀 분석 및 DB 저장 완료! 이제 조회 가능합니다.");

            } catch (Exception e) {
                System.out.println("결과 해석 중 에러 발생: " + e.getMessage());
            }

            System.out.println("5. AI 정밀 분석 완료! 몽고DB 확인 준비 완료.");

        } catch (Exception e) {
            System.out.println("에러 발생: " + e.getMessage());
        }
    }
}