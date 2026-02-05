package com.a407.sniffythedog.application.gamelog.out;

import com.a407.sniffythedog.domain.game.entity.GameHistory;
import com.a407.sniffythedog.domain.game.entity.Participant;
import com.a407.sniffythedog.domain.game.vo.GameHistoryId;

import java.util.List;

public interface GameHistorySavePort {

    GameHistory save(GameHistory gameHistory);

    /**
     * 게임 참가자들의 상세 기록을 일괄 저장합니다.
     * @param participants 도메인 참가자 목록
     * @param gameHistoryId 연관된 게임 ID
     */
    void saveParticipants(List<Participant> participants, GameHistoryId gameHistoryId);
}
