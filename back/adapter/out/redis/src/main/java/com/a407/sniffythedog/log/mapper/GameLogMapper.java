package com.a407.sniffythedog.log.mapper;

import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import com.a407.sniffythedog.log.entity.RedisGameLogMetaJson;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GameLogMapper {
    private final ObjectMapper objectMapper;

    // GameEvent -> JSON
    public String eventToJson(GameEvent event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("GameEvent JSON 변환 오류", e);
        }
    }

    // JSON -> GameEvent
    public GameEvent jsonToEvent(String json) {
        try {
            return objectMapper.readValue(json, GameEvent.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("GameEvent JSON 파싱 오류", e);
        }
    }

    // MetaData -> JSON
    public String metaToJson(RedisGameLogMetaJson meta) {
        try {
            return objectMapper.writeValueAsString(meta);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("GameLog Meta JSON 변환 오류", e);
        }
    }

    // JSON -> MetaData
    public RedisGameLogMetaJson jsonToMeta(String json) {
        try {
            return objectMapper.readValue(json, RedisGameLogMetaJson.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("GameLog Meta JSON 파싱 오류", e);
        }
    }
}
