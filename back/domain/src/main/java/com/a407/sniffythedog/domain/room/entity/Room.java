package com.a407.sniffythedog.domain.room.entity;

import com.a407.sniffythedog.domain.room.enums.RoomStatus;
import com.a407.sniffythedog.domain.room.vo.RoomId;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Room {

    private final RoomId roomId;
    private final String title;
    private final boolean isPrivate;
    private final int capacity;
    private final RoomStatus status;
    private final long hostUserId;

    private final List<RoomPlayer> players = new ArrayList<>();

    public Room(RoomId roomId,
                String title,
                boolean isPrivate,
                int capacity,
                RoomStatus status,
                long hostUserId,
                List<RoomPlayer> initialPlayers) {

        if (title == null || title.isBlank()) throw new IllegalArgumentException("title is blank");
        if (capacity <= 0) throw new IllegalArgumentException("capacity must be positive");
        if (status == null) throw new IllegalArgumentException("status is null");

        this.roomId = roomId;
        this.title = title;
        this.isPrivate = isPrivate;
        this.capacity = capacity;
        this.status = status;
        this.hostUserId = hostUserId;

        if (initialPlayers != null) this.players.addAll(initialPlayers);
    }

    public RoomId roomId() { return roomId; }
    public String title() { return title; }
    public boolean isPrivate() { return isPrivate; }
    public int capacity() { return capacity; }
    public RoomStatus status() { return status; }
    public long hostUserId() { return hostUserId; }

    public List<RoomPlayer> players() {
        return Collections.unmodifiableList(players);
    }
}
