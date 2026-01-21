package com.a407.sniffythedog.room.entity;

import com.a407.sniffythedog.domain.game.enums.RoomStatus;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.time.Instant;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("room")
public class RoomEntity {

    @Id
    private String id;

    private String title;

    private boolean isPrivate;

    @Indexed    //비공개방 입장용
    private String inviteCode;

    private int capacity;

    private Long hostUserId;

    private RoomStatus status;

    private long version;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant startedAt;

    private Instant endedAt;

    //Json String
    private String players;
    private String gameState;
}
