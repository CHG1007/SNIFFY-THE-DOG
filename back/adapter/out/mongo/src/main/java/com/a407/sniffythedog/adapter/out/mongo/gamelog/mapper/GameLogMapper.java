package com.a407.sniffythedog.adapter.out.mongo.gamelog.mapper;

import com.a407.sniffythedog.adapter.out.mongo.gamelog.document.GameLogDocument;
import com.a407.sniffythedog.adapter.out.mongo.gamelog.document.GameLogDocument.GameEventDoc;
import com.a407.sniffythedog.adapter.out.mongo.gamelog.document.GameLogDocument.PlayerResultDoc;
import com.a407.sniffythedog.domain.game.enums.GameRole;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.enums.Winner;
import com.a407.sniffythedog.domain.gamelog.entity.GameLog;
import com.a407.sniffythedog.domain.gamelog.enums.GameEventType;
import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import com.a407.sniffythedog.domain.gamelog.vo.GameLogId;
import com.a407.sniffythedog.domain.gamelog.vo.PlayerResult;

import java.util.List;
import java.util.Map;

public class GameLogMapper {

    private GameLogMapper() {
    }

    public static GameLogDocument toDocument(GameLog gameLog) {
        // AI 리포트 Map
        Map<Long, String> aiReports = gameLog.getAiReports();

        // 2. 플레이어를 도큐먼트로 바꿀 때, 맵에서 자기 ID를 열쇠로 리포트를 찾아 넣어줍니다.
        List<PlayerResultDoc> playerDocs = gameLog.getPlayers().stream()
                .map(p -> toPlayerDoc(p, aiReports.getOrDefault(p.odUserId(), "분석 중...")))
                .toList();

        List<GameEventDoc> eventDocs = gameLog.getEvents().stream()
                .map(GameLogMapper::toEventDoc)
                .toList();

        // 3. Document 생성자 순서에 맞춰서 데이터 전달
        return new GameLogDocument(
                gameLog.getId() != null ? gameLog.getId().value() : null,
                gameLog.getRoomId(),
                playerDocs,
                eventDocs,
                gameLog.getWinner() != null ? gameLog.getWinner().name() : null,
                gameLog.getStartedAt(),
                gameLog.getEndedAt(),
                gameLog.getTotalSummary()
        );
    }

    public static GameLog toDomain(GameLogDocument doc) {
        List<PlayerResult> players = doc.getPlayers().stream()
                .map(GameLogMapper::toPlayerResult)
                .toList();

        List<GameEvent> events = doc.getEvents().stream()
                .map(GameLogMapper::toGameEvent)
                .toList();

        GameLog gameLog = GameLog.reconstitute(
                GameLogId.of(doc.getId()),
                doc.getRoomId(),
                players,
                events,
                doc.getWinner() != null ? Winner.valueOf(doc.getWinner()) : null,
                doc.getStartedAt(),
                doc.getEndedAt()
        );

        // 2. DB에 있던 전체 요약 -> 도메인
        gameLog.updateTotalSummary(doc.getTotalSummary());

        // 3. DB의 players 리스트 안에 있던 aiReport들 -> GameLog의 aiReports
        if (doc.getPlayers() != null) {
            doc.getPlayers().forEach(p -> {
                if (p.getAiReport() != null) {
                    gameLog.addAiReport(p.getOdUserId(), p.getAiReport());
                }
            });
        }

        return gameLog;
    }

    private static PlayerResultDoc toPlayerDoc(PlayerResult player, String aiReport) {
        return new PlayerResultDoc(
                player.odUserId(),
                player.odNickname(),
                player.role().name(),
                player.survived(),
                aiReport // 해당 유저의 개인 활약상
        );
    }

    private static PlayerResult toPlayerResult(PlayerResultDoc doc) {
        return PlayerResult.of(
                doc.getOdUserId(),
                doc.getOdNickname(),
                GameRole.valueOf(doc.getRole()),
                doc.isSurvived()
        );
    }

    private static GameEventDoc toEventDoc(GameEvent event) {
        GameEventDoc doc = new GameEventDoc(
                event.type().name(),
                event.round(),
                event.actorUserId(),
                event.targetUserId(),
                event.voteResult(),
                event.timestamp()
        );

        doc.setMafiaTargetUserId(event.mafiaTargetUserId());
        doc.setDoctorTargetUserId(event.doctorTargetUserId());
        doc.setKilledUserId(event.killedUserId());
        doc.setIsMafia(event.isMafia());
        doc.setSaved(event.saved());

        doc.setPhase(event.phase() == null ? null : event.phase().name());
        doc.setWinnerTeam(event.winnerTeam());

        return doc;
    }

    private static GameEvent toGameEvent(GameEventDoc doc) {
        return new GameEvent(
                GameEventType.valueOf(doc.getType()),
                doc.getRound(),
                doc.getActorUserId(),
                doc.getTargetUserId(),
                doc.getVoteResult(),

                doc.getIsMafia(),

                doc.getMafiaTargetUserId(),
                doc.getDoctorTargetUserId(),
                doc.getKilledUserId(),
                doc.getSaved(),

                doc.getAgreeCount(),
                doc.getDisagreeCount(),

                doc.getPhase() == null ? null : Phase.valueOf(doc.getPhase()),
                doc.getWinnerTeam(),

                doc.getTimestamp()
        );
    }
}