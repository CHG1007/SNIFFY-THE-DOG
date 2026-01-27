package com.a407.sniffythedog.adapter.out.mongo.gamelog.mapper;

import com.a407.sniffythedog.adapter.out.mongo.gamelog.document.GameLogDocument;
import com.a407.sniffythedog.adapter.out.mongo.gamelog.document.GameLogDocument.GameEventDoc;
import com.a407.sniffythedog.adapter.out.mongo.gamelog.document.GameLogDocument.PlayerResultDoc;
import com.a407.sniffythedog.domain.game.enums.GameRole;
import com.a407.sniffythedog.domain.game.enums.Winner;
import com.a407.sniffythedog.domain.gamelog.entity.GameLog;
import com.a407.sniffythedog.domain.gamelog.enums.GameEventType;
import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import com.a407.sniffythedog.domain.gamelog.vo.GameLogId;
import com.a407.sniffythedog.domain.gamelog.vo.PlayerResult;

import java.util.List;

public class GameLogMapper {

    private GameLogMapper() {
    }

    public static GameLogDocument toDocument(GameLog gameLog) {
        List<PlayerResultDoc> playerDocs = gameLog.getPlayers().stream()
                .map(GameLogMapper::toPlayerDoc)
                .toList();

        List<GameEventDoc> eventDocs = gameLog.getEvents().stream()
                .map(GameLogMapper::toEventDoc)
                .toList();

        return new GameLogDocument(
                gameLog.getId() != null ? gameLog.getId().value() : null,
                gameLog.getRoomId(),
                playerDocs,
                eventDocs,
                gameLog.getWinner() != null ? gameLog.getWinner().name() : null,
                gameLog.getStartedAt(),
                gameLog.getEndedAt()
        );
    }

    public static GameLog toDomain(GameLogDocument doc) {
        List<PlayerResult> players = doc.getPlayers().stream()
                .map(GameLogMapper::toPlayerResult)
                .toList();

        List<GameEvent> events = doc.getEvents().stream()
                .map(GameLogMapper::toGameEvent)
                .toList();

        return GameLog.reconstitute(
                GameLogId.of(doc.getId()),
                doc.getRoomId(),
                players,
                events,
                doc.getWinner() != null ? Winner.valueOf(doc.getWinner()) : null,
                doc.getStartedAt(),
                doc.getEndedAt()
        );
    }

    private static PlayerResultDoc toPlayerDoc(PlayerResult player) {
        return new PlayerResultDoc(
                player.odUserId(),
                player.odNickname(),
                player.role().name(),
                player.survived()
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
        return new GameEventDoc(
                event.type().name(),
                event.round(),
                event.actorUserId(),
                event.targetUserId(),
                event.voteResult(),
                event.timestamp()
        );
    }

    private static GameEvent toGameEvent(GameEventDoc doc) {
        return new GameEvent(
                GameEventType.valueOf(doc.getType()),
                doc.getRound(),
                doc.getActorUserId(),
                doc.getTargetUserId(),
                doc.getVoteResult(),
                doc.getTimestamp()
        );
    }
}
