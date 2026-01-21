package com.a407.sniffythedog.adapter.out.rdb.room.repository;

import com.a407.sniffythedog.application.room.out.RoomPort;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class RoomRepositoryAdapter implements RoomPort {

    private final Map<RoomId, RoomSession> store = new ConcurrentHashMap<>();

    @Override
    public void saveRoom(RoomSession roomSession) {
        store.put(roomSession.getId(), roomSession);
    }

    @Override
    public List<RoomSession> loadPublicRooms(int page, int size) {
        return store.values().stream()
                .filter(room -> !room.isPrivate())
                .sorted(Comparator.comparing(RoomSession::getCreatedAt).reversed())
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());
    }
}
