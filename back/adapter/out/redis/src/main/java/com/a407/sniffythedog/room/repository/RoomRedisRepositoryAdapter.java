package com.a407.sniffythedog.room.repository;


import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import com.a407.sniffythedog.room.mapper.RoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.SessionCallback;
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
    
    // 낙관적락
    // roomSession에 동시에 요청이 와도 안꼬이게 실행함 -> 내꺼 취소 -> room데이터 안바뀌고 index 안바뀜
    // room JSON을 읽고 수정해서 저장하는데 누가 끼어들어 roomKey 바꿨으면 내 저장 취소 하고 다시 시도하여 저장
    @Override
    public RoomSession updateRoomAtomically(RoomId roomId, UnaryOperator<RoomSession> mutator) {
        String roomKey = ROOM_KEY_PREFIX + roomId.value();
        int maxRetries = 10; // 재시도 횟수

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            RoomSession updated = redisTemplate.execute(new SessionCallback<RoomSession>() {
                @Override
                @SuppressWarnings({"unchecked", "rawtypes"})

                public RoomSession execute(RedisOperations operations) {

                    // 1. 감시 시작 : roomKey 기반으로 업데이트 할건데 누가 끼어들면 내 저장 취소
                    operations.watch(roomKey);

                    // 2. 룸 상태 읽기
                    String json = (String) operations.opsForValue().get(roomKey);
                    if (json == null || json.isBlank()) {
                        operations.unwatch(); // 없으니까 감시 안함
                        throw ApplicationException.of(ExceptionType.ROOM_NOT_FOUND);
                    }

                    // 3) 룸 상태의 문자열을 RoomSession이라는 도메인으로 만듬
                    RoomSession current = roomMapper.toDomain(json);
                    RoomSession next = mutator.apply(current); // mutator은 수정함수 현재 상태 받아서 새 상태 반환

                    // 4) 저장할 JSON 생성
                    String nextJson = roomMapper.toRedisJson(next);

                    // 5) 트랜잭션 시작 -> 저장
                    operations.multi(); // 모아두고
                    operations.opsForValue().set(roomKey, nextJson);

                    // 공개/비공개 인덱스를 여기에서 함께 갱신하면 더 완전함 , inviteCode 인덱스 한다면 여기서 같이 갱신
                    // 6) 실행: 감시 중 키가 변경되었으면 execResult가 null (즉, 충돌 발생)
                    List<Object> execResult = operations.exec();
                    if (execResult == null) {
                        return null;
                    }
                    return next;
                }
            });

            if (updated != null) {
                return updated;
            }
            // updated == null => 충돌났으니 retry
        }
        throw ApplicationException.of(ExceptionType.ROOM_CONCURRENT_UPDATE_FAILED);
    }
}
