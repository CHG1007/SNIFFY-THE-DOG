package com.a407.sniffythedog.room.repository;


import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import com.a407.sniffythedog.room.mapper.RoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class RoomRedisRepositoryAdapter implements RedisRoomPort {

    private static final String PUBLIC_ROOMS_KEY = "room:public";
    private static final String ROOM_KEY_PREFIX = "room:";
    private static final String INVITE_KEY_PREFIX = "invite:";

    private final RoomMapper roomMapper;
    private final StringRedisTemplate redisTemplate;

    @Override
    public void saveRoom(RoomSession roomSession) {
        String jsonValue = roomMapper.toRedisJson(roomSession);

        String key = ROOM_KEY_PREFIX + roomSession.getId().value();

        redisTemplate.opsForValue().set(key, jsonValue);

        ZSetOperations<String, String> zSet = redisTemplate.opsForZSet();
        if (!roomSession.isPrivate()) {
            double score = roomSession.getCreatedAt().toEpochMilli();
            zSet.add(PUBLIC_ROOMS_KEY, roomSession.getId().value(), score);
        }
    }

    @Override
    public List<RoomSession> loadPublicRooms(int page, int size) {
        ZSetOperations<String, String> zSet = redisTemplate.opsForZSet();

        int start = page * size;
        int end = start + size - 1;

        Set<String> roomIds = zSet.reverseRange(PUBLIC_ROOMS_KEY, start, end);

        if (roomIds == null || roomIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> keys = roomIds.stream()
                .map(id -> ROOM_KEY_PREFIX + id)
                .collect(Collectors.toList());

        List<String> jsonList = redisTemplate.opsForValue().multiGet(keys);

        if (jsonList == null) {
            return Collections.emptyList();
        }

        return jsonList.stream()
                .filter(Objects::nonNull)
                .map(roomMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<RoomSession> loadRoom(RoomId roomId) {
        String key = ROOM_KEY_PREFIX + roomId.value(); // key는 room : {roomId}로 들어옴
        String json = redisTemplate.opsForValue().get(key); // key 값 꺼내오는 기능

        if (json == null || json.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(roomMapper.toDomain(json)); //  역직렬화 : json이 있으면 도메인 객체로 반환
    }

    @Override
    public Optional<RoomSession> loadRoomByInviteCode(String inviteCode) {
        if (inviteCode == null || inviteCode.isBlank()) {
            return Optional.empty();
        }

        String inviteKey = INVITE_KEY_PREFIX + inviteCode;
        String roomIdValue = redisTemplate.opsForValue().get(inviteKey);

        if (roomIdValue == null || roomIdValue.isBlank()) {
            return Optional.empty();
        }
        return loadRoom(RoomId.of(roomIdValue));
    }


    @Override
    public RoomSession updateRoomAtomically(RoomId roomId, UnaryOperator<RoomSession> mutator) {
        return null;
    }
}
