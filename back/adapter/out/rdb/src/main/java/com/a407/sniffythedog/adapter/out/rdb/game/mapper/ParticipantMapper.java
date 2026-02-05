package com.a407.sniffythedog.adapter.out.rdb.game.mapper;

import com.a407.sniffythedog.adapter.out.rdb.game.entity.GameHistoryEntity;
import com.a407.sniffythedog.adapter.out.rdb.game.entity.ParticipantEntity;
import com.a407.sniffythedog.domain.game.entity.Participant;
import com.a407.sniffythedog.domain.game.vo.GameHistoryId;
import com.a407.sniffythedog.domain.game.vo.ParticipantId;
import com.a407.sniffythedog.domain.user.vo.UserId;

public class ParticipantMapper {

    private ParticipantMapper() {
    }

    // [추가] 도메인 -> 엔티티 변환
    public static ParticipantEntity toEntity(Participant domain, GameHistoryEntity gameHistoryEntity) {
        return new ParticipantEntity(
                domain.getId() != null ? domain.getId().value() : null,
                domain.getUserId().value(),
                gameHistoryEntity, // FK 설정을 위한 연관 객체
                domain.getJob(),
                domain.getResult(),
                domain.isAlive()
        );
    }

    public static Participant toDomain(ParticipantEntity entity) {
        return Participant.reconstitute(
            ParticipantId.of(entity.getId()),
            UserId.of(entity.getUserId()),
            GameHistoryId.of(entity.getGameHistory().getId()),
            entity.getJob(),
            entity.getResult(),
            entity.isAlive()
        );
    }
}
