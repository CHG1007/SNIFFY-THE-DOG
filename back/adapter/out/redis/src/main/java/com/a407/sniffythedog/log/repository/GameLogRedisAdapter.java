package com.a407.sniffythedog.log.repository;

import com.a407.sniffythedog.application.gamelog.out.GameLogRedisPort;
import com.a407.sniffythedog.application.gamelog.out.TempGameLogData;
import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import com.a407.sniffythedog.domain.gamelog.vo.PlayerResult;
import com.a407.sniffythedog.log.entity.RedisGameLogMetaJson;
import com.a407.sniffythedog.log.mapper.GameLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class GameLogRedisAdapter implements GameLogRedisPort {

    private final StringRedisTemplate redisTemplate;
    private final GameLogMapper gameLogMapper;

    private static final String KEY_PREFIX_META = "gamelog:meta:";
    private static final String KEY_PREFIX_EVENTS = "gamelog:events:";
    private static final long TTL_HOURS = 24; // 24시간 보관

    @Override
    public void initGameLog(String roomId, List<PlayerResult> players, Instant startedAt) {
        String key = KEY_PREFIX_META + roomId;
        RedisGameLogMetaJson meta = new RedisGameLogMetaJson(roomId, players, startedAt);

        redisTemplate.opsForValue().set(key, gameLogMapper.metaToJson(meta));
        redisTemplate.expire(key, TTL_HOURS, TimeUnit.HOURS);
    }

    @Override
    public void saveEvent(String roomId, GameEvent event) {
        String key = KEY_PREFIX_EVENTS + roomId;
        String json = gameLogMapper.eventToJson(event);

        // List의 오른쪽에 추가 (순서 보장) , 게임 로그 메타 + 이벤트 리스트 둘다 Redis에 24시간 뒤에 삭제됨
        redisTemplate.opsForList().rightPush(key, json);
        redisTemplate.expire(key, TTL_HOURS, TimeUnit.HOURS);
    }

    @Override
    public Optional<TempGameLogData> loadGameLog(String roomId) {
        String metaKey = KEY_PREFIX_META + roomId;
        String eventKey = KEY_PREFIX_EVENTS + roomId;

        // 1. 메타데이터 조회
        String metaJson = redisTemplate.opsForValue().get(metaKey);
        if (metaJson == null) return Optional.empty();
        RedisGameLogMetaJson meta = gameLogMapper.jsonToMeta(metaJson);

        // 2. 이벤트 리스트 조회 (전체 조회)
        List<String> eventJsons = redisTemplate.opsForList().range(eventKey, 0, -1);
        List<GameEvent> events = (eventJsons == null) ? List.of() :
                eventJsons.stream().map(gameLogMapper::jsonToEvent).collect(Collectors.toList());

        // 3. TempGameLogData로 반환 (gameHistoryId는 나중에 GameResultService에서 설정)
        return Optional.of(new TempGameLogData(meta.players(), events, meta.startedAt()));
    }

    @Override
    public void deleteGameLog(String roomId) {
        redisTemplate.delete(List.of(KEY_PREFIX_META + roomId, KEY_PREFIX_EVENTS + roomId));
    }
}
