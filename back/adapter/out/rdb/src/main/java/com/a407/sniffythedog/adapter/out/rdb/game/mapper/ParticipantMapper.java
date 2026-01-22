package com.a407.sniffythedog.adapter.out.rdb.game.mapper;

import com.a407.sniffythedog.adapter.out.rdb.game.entity.ParticipantEntity;
import com.a407.sniffythedog.domain.game.entity.Participant;
import com.a407.sniffythedog.domain.game.vo.GameHistoryId;
import com.a407.sniffythedog.domain.game.vo.ParticipantId;
import com.a407.sniffythedog.domain.user.vo.UserId;

public class ParticipantMapper {

    private ParticipantMapper() {
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
