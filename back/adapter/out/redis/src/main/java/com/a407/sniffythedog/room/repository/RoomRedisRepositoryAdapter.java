package com.a407.sniffythedog.room.repository;


import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.application.room.out.RoomPort;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.room.entity.RoomEntity;
import com.a407.sniffythedog.room.mapper.RoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Primary
@Repository
@RequiredArgsConstructor
public class RoomRedisRepositoryAdapter implements RedisRoomPort {

    private static final String PUBLIC_ROOMS_KEY = "room:public";

    private final RoomRedisRepository roomRedisRepository;
    private final RoomMapper roomMapper;
    //공개방 정렬, 조회용
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void saveRoom(RoomSession roomSession) {
        RoomEntity entity = roomMapper.toEntity(roomSession);
        roomRedisRepository.save(entity);

        ZSetOperations<String, String> zSet = redisTemplate.opsForZSet();
        if(!roomSession.isPrivate()){
            double score =roomSession.getCreatedAt().toEpochMilli();
            zSet.add(PUBLIC_ROOMS_KEY, entity.getId(), score);
        }

    }

    @Override
    public List<RoomSession> loadPublicRooms(int page, int size) {
        ZSetOperations<String, String> zSet = redisTemplate.opsForZSet();

        int start = page*size;
        int end = start + size - 1;

        Set<String> roomIds = zSet.reverseRange(PUBLIC_ROOMS_KEY, start, end);

        if (roomIds == null || roomIds.isEmpty()) {
            return Collections.emptyList();
        }

        Iterable<RoomEntity> entities = roomRedisRepository.findAllById(roomIds);
        return StreamSupport.stream(entities.spliterator(), false)
                .filter(Objects::nonNull)
                .map(roomMapper::toDomain)
                .collect(Collectors.toList());

    }
}
