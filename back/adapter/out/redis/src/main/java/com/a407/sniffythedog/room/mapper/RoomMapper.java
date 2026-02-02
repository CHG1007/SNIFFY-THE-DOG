package com.a407.sniffythedog.room.mapper;

import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.*;
import com.a407.sniffythedog.room.entity.RedisPlayerState;
import com.a407.sniffythedog.room.entity.RedisRoomJson;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.stream.Collectors;


public class RoomMapper {

    private final ObjectMapper objectMapper;

    public RoomMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper.copy()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    // 1. 도메인 -> Redis (저장)
    public String toRedisJson(RoomSession domain) {
        try {
            Map<String, RedisPlayerState> playerDtos = domain.getPlayers().values().stream()
                    .collect(Collectors.toMap(
                            p -> String.valueOf(p.getUserId().value()), // Key: "1"
                            p -> new RedisPlayerState(                  // Value: DTO
                                    p.getUserId().value(),
                                    p.getDisplayName(),
                                    p.isHost(),           // 👈 getter 확인 필요 (없으면 추가)
                                    p.getJoinedAt(),      // 👈 getter 확인 필요
                                    p.isReady(),
                                    p.isAlive(),
                                    p.getGameRole(),
                                    p.getRemainingChances() // 👈 getter 확인 필요
                            )
                    ));

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
                    playerDtos,
                    domain.getGameState()
            );
            return objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 변환 오류", e);
        }
    }

    // 2. Redis -> 도메인 (불러오기)
    public RoomSession toDomain(String json) {
        try {
            RedisRoomJson dto = objectMapper.readValue(json, RedisRoomJson.class);

            Map<GameUserId, PlayerState> players = dto.players().values().stream()
                    .collect(Collectors.toMap(
                            p -> GameUserId.of(p.userId()),
                            p -> PlayerState.reconstitute( // ✅ 이미 있는 메서드 호출!
                                    GameUserId.of(p.userId()),
                                    p.displayName(),
                                    p.isHost(),        // 추가된 필드들
                                    p.joinedAt(),
                                    p.isReady(),
                                    p.isAlive(),
                                    p.role(),
                                    p.remainingChances()
                            )
                    ));

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
                    players,
                    dto.gameState()
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON 파싱 오류", e);
        }
    }
}