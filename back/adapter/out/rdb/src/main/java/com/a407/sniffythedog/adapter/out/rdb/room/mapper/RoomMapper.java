package com.a407.sniffythedog.adapter.out.rdb.room.mapper;

import com.a407.sniffythedog.adapter.out.rdb.room.entity.RoomEntity;
import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.GameState;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import com.a407.sniffythedog.domain.game.vo.RoomTitle;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class RoomMapper {

    private final ObjectMapper objectMapper;

    public RoomSession toDomain(RoomEntity entity) {
        try {
            Map<GameUserId, PlayerState> players = objectMapper.readValue(
                    entity.getPlayers(),
                    new TypeReference<Map<GameUserId, PlayerState>>() {
                    }
            );

            GameState gameState = objectMapper.readValue(
                    entity.getGameState(),
                    GameState.class
            );

            return RoomSession.reconstitute(
                    RoomId.of(entity.getId()),
                    RoomTitle.of(entity.getTitle()),
                    entity.isPrivate(),
                    entity.getInviteCode(),
                    entity.getCapacity(),
                    GameUserId.of(entity.getHostUserId()),
                    entity.getStatus(),
                    entity.getVersion(),
                    entity.getCreatedAt(),
                    entity.getUpdatedAt(),
                    entity.getStartedAt(),
                    entity.getEndedAt(),
                    players,
                    gameState
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize RoomEntity to RoomSession", e);
        }
    }

    public RoomEntity toEntity(RoomSession domain) {
        try {
            String players = objectMapper.writeValueAsString(domain.getPlayers());
            String gameState = objectMapper.writeValueAsString(domain.getGameState());

            return RoomEntity.builder()
                    .id(domain.getId().value())
                    .title(domain.getTitle().value())
                    .isPrivate(domain.isPrivate())
                    .inviteCode(domain.getInviteCode())
                    .capacity(domain.getCapacity())
                    .hostUserId(domain.getHostUserId().value())
                    .status(domain.getStatus())
                    .version(domain.getVersion())
                    .createdAt(domain.getCreatedAt())
                    .updatedAt(domain.getUpdatedAt())
                    .startedAt(domain.getStartedAt())
                    .endedAt(domain.getEndedAt())
                    .players(players)
                    .gameState(gameState)
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize RoomSession to Redis", e);
        }
    }
}
