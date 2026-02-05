package com.a407.sniffythedog.adapter.out.rdb.game.repository;

import com.a407.sniffythedog.adapter.out.rdb.game.entity.GameHistoryEntity;
import com.a407.sniffythedog.adapter.out.rdb.game.entity.ParticipantEntity;
import com.a407.sniffythedog.adapter.out.rdb.game.mapper.GameHistoryMapper;
import com.a407.sniffythedog.adapter.out.rdb.game.mapper.ParticipantMapper;
import com.a407.sniffythedog.application.gamelog.out.GameHistorySavePort;
import com.a407.sniffythedog.domain.game.entity.GameHistory;
import com.a407.sniffythedog.domain.game.entity.Participant;
import com.a407.sniffythedog.domain.game.vo.GameHistoryId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class GameHistorySaveAdapter implements GameHistorySavePort {

    private final GameHistoryJpaRepository jpaRepository;
    private final ParticipantJpaRepository participantJpaRepository;

    @Override
    public GameHistory save(GameHistory gameHistory) {
        GameHistoryEntity entity = GameHistoryMapper.toEntity(gameHistory);
        GameHistoryEntity saved = jpaRepository.save(entity);
        return GameHistoryMapper.toDomain(saved);
    }

    @Override
    public void saveParticipants(List<Participant> participants, GameHistoryId gameHistoryId) {
        if (participants == null || participants.isEmpty()) {
            return;
        }

        //SELECT 쿼리 없이 FK 매핑을 위한 Proxy 객체만 조회
        GameHistoryEntity gameHistoryProxy = jpaRepository.getReferenceById(gameHistoryId.value());

        // Stream을 사용하여 Entity 변환
        List<ParticipantEntity> participantEntities = participants.stream()
                .map(participant -> ParticipantMapper.toEntity(participant, gameHistoryProxy))
                .toList();

        // Bulk Insert (Batch size 설정이 되어있다면 성능 향상)
        participantJpaRepository.saveAll(participantEntities);
    }

}
