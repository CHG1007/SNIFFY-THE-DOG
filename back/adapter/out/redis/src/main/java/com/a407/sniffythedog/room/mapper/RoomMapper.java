package com.a407.sniffythedog.room.mapper;

import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.*;
import com.a407.sniffythedog.room.entity.RedisRoomJson;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomMapper {

    private final ObjectMapper objectMapper;

    public String toRedisJson(RoomSession domain) {
        try {
            RedisRoomJson dto = new RedisRoomJson(
                    domain.getId().value(),
                    domain.getTitle().value(),
                    domain.isPrivate(),
                    domain.getInviteCode(),
                    domain.getCapacity(),
                    domain.getHostUserId().value(),
                    domain.getStatus(),
                    domain.getVersion(),
                    domain.getCreatedAt(),
                    domain.getUpdatedAt(),
                    domain.getStartedAt(),
                    domain.getEndedAt(),
                    domain.getPlayers(),
                    domain.getGameState()
            );
            return objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 오류", e);
        }
    }

    public RoomSession toDomain(String json) {
        try {
            RedisRoomJson dto = objectMapper.readValue(json, RedisRoomJson.class);
            return RoomSession.reconstitute(
                    RoomId.of(dto.id()),
                    RoomTitle.of(dto.title()),
                    dto.isPrivate(),
                    dto.inviteCode(),
                    dto.capacity(),
                    GameUserId.of(dto.hostUserId()),
                    dto.status(),
                    dto.version(),
                    dto.createdAt(),
                    dto.updatedAt(),
                    dto.startedAt(),
                    dto.endedAt(),
                    dto.players(),
                    dto.gameState()
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 파싱 오류", e);
        }
    }
}
