package com.a407.sniffythedog.application.gamelog;

import com.a407.sniffythedog.application.gamelog.in.MyGameLogResult;
import com.a407.sniffythedog.application.gamelog.out.GameHistorySavePort;
import com.a407.sniffythedog.application.gamelog.out.GameLogRedisPort;
import com.a407.sniffythedog.application.gamelog.out.GameLogGmsPort;
import com.a407.sniffythedog.application.gamelog.out.GameLogPort;
import com.a407.sniffythedog.application.gamelog.out.TempGameLogData;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.entity.GameHistory;
import com.a407.sniffythedog.domain.game.entity.Participant;
import com.a407.sniffythedog.domain.game.enums.GameResult;
import com.a407.sniffythedog.domain.game.enums.GameRole;
import com.a407.sniffythedog.domain.game.enums.Winner;
import com.a407.sniffythedog.domain.gamelog.entity.GameLog;
import com.a407.sniffythedog.domain.user.vo.UserId;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameResultService {
    private final GameLogPort gameLogPort; // MongoDB 저장
    private final GameLogRedisPort gameLogRedisPort; // Redis 로그 수집
    private final GameHistorySavePort gameHistorySavePort; // MySQL GameHistory 저장
    private final ObjectMapper objectMapper; // JSON 해석
    private final GameLogGmsPort gameLogGmsPort; // AI 분석
    private final RedisRoomPort redisRoomPort; // Redis 방 삭제
    private final StringRedisTemplate redisTemplate;    //동시성 제어

    @Async // 비동기로 백그라운드에서 실행합니다.
    public void processGameResult(String roomId, Winner winner, Instant startAt, Instant endAt) {

        String lockKey = "game:result:lock:" + roomId;
        Boolean isLocked = redisTemplate.opsForValue().setIfAbsent(lockKey, "processing", 1, TimeUnit.MINUTES);

        // 이미 락이 걸려있다면(다른 스레드가 처리 중이라면) 중단
        if (Boolean.FALSE.equals(isLocked)) {
            log.warn("[GameResult] 이미 처리 중인 게임입니다. roomId={}", roomId);
            return;
        }

        try {
            // 1. Redis에서 임시 로그 데이터(Player 목록 + 이벤트 목록) 가져오기
            TempGameLogData tempData = gameLogRedisPort.loadGameLog(roomId)
                    .orElseThrow(() -> new RuntimeException("해당 방의 게임 로그를 찾을 수 없습니다: " + roomId));

            // 2. GameHistory 생성 및 MySQL 저장 → gameHistoryId 획득
            int playTime = (int) Duration.between(startAt, endAt).getSeconds();
            GameHistory history = GameHistory.create(roomId, winner, startAt, endAt, playTime);
            GameHistory savedHistory = gameHistorySavePort.save(history);
            Long gameHistoryId = savedHistory.getId().value();

            //추가 게임 참가자 각각 저장
            List<Participant> participants = tempData.players().stream()
                    .map(p -> {
                        boolean isWin;
                        if (winner == Winner.CITIZEN) {
                            // 시민팀 승리: 시민, 의사, 경찰
                            isWin = (p.role() == GameRole.CITIZEN || p.role() == GameRole.DOCTOR || p.role() == GameRole.POLICE);
                        } else {
                            // 마피아팀 승리: 마피아
                            isWin = (p.role() == GameRole.MAFIA);
                        }
                        return Participant.create(
                                UserId.of(p.odUserId()),
                                savedHistory.getId(),
                                p.role(),
                                isWin ? GameResult.WIN : GameResult.LOSE,
                                p.survived()
                        );
                    })
                    .toList();

            // 2-2. 참가자 목록 따로 저장 (새로 만든 메서드 호출)
            gameHistorySavePort.saveParticipants(participants, savedHistory.getId());

            // 3. GameLog 생성 (gameHistoryId 사용)
            GameLog gameLog = GameLog.create(gameHistoryId, tempData.players(), tempData.startedAt());
            // 이벤트 복사
            tempData.events().forEach(gameLog::addEvent);
            // winner 설정
            gameLog.finish(winner, tempData.players());

            // 4. 순수 로그 상태를 MongoDB에 저장 (gameHistoryId 키 사용)
            gameLogPort.save(gameLog);

            // 5. 모든 저장이 끝났으므로 Redis 임시 로그 삭제
            gameLogRedisPort.deleteGameLog(roomId);

            // 6. Redis에서 방 삭제 (공개 목록 인덱스 포함)
            redisRoomPort.deleteRoom(roomId);
        } catch (Exception e) {
            log.error("[GameResult] roomId={} 게임 결과 저장 실패", roomId, e);
        }
    }

    /**
     * AI 분석 리포트 생성 요청 (사용자가 요청할 때만 수행)
     */
    public void requestAiAnalysis(Long gameHistoryId) {
        // 1. MongoDB에서 로그 조회
        GameLog gameLog = gameLogPort.findByGameHistoryId(gameHistoryId)
                .orElseThrow(() -> new RuntimeException("게임 로그를 찾을 수 없습니다."));

        // 이미 분석 결과가 있다면 스킵
        if (gameLog.getTotalSummary() != null && !gameLog.getTotalSummary().isEmpty()
                && !gameLog.getTotalSummary().equals("AI 분석 결과 해석 실패")
                && !gameLog.getTotalSummary().equals("데이터를 분석 중입니다...")) {
            return;
        }

        // 상태 업데이트
        gameLog.updateTotalSummary("데이터를 분석 중입니다...");
        gameLogPort.save(gameLog);

        // 비동기로 AI 분석 진행
        performAiAnalysis(gameLog);
    }

    @Async
    protected void performAiAnalysis(GameLog gameLog) {
        // AI 분석 재료 준비
        List<String> playerInfos = gameLog.getPlayers().stream()
                .map(p -> p.odUserId() + ":" + p.odNickname() + ":" + p.role().name())
                .toList();

        List<String> eventTexts = gameLog.getEvents().stream()
                .map(e -> String.format("[%d라운드] %s 발생", e.round(), e.type().name()))
                .toList();

        // AI 통합 분석 요청
        try {
            String jsonResponse = gameLogGmsPort.generateReport(playerInfos, eventTexts);

            // AI 결과 해석 및 저장
            JsonNode root = objectMapper.readTree(jsonResponse);
            gameLog.updateTotalSummary(root.path("totalSummary").asText());

            JsonNode reports = root.path("playerReports");
            gameLog.getPlayers().forEach(p -> {
                String personalReport = reports.path(String.valueOf(p.odUserId())).asText();
                gameLog.addAiReport(p.odUserId(), personalReport);
            });
        } catch (Exception e) {
            gameLog.updateTotalSummary("AI 분석 결과 해석 실패");
        }

        // 최종본 저장
        gameLogPort.save(gameLog);
    }

    public MyGameLogResult getMyAnalysis(Long gameHistoryId, Long userId) {
        // 1. 몽고DB에서 gameHistoryId로 게임 로그를 찾습니다.
        GameLog gameLog = gameLogPort.findByGameHistoryId(gameHistoryId)
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
}