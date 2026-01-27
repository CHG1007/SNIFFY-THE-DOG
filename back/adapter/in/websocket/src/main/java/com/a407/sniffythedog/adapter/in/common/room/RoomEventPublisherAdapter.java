package com.a407.sniffythedog.adapter.in.common.room;

import com.a407.sniffythedog.application.vote.out.RoomEventPort;
import com.a407.sniffythedog.adapter.in.common.room.message.PlayerStatusChangedMessage;
import com.a407.sniffythedog.adapter.in.common.room.message.Vote1ResultMessage;
import com.a407.sniffythedog.adapter.in.common.room.message.Vote1UpdateMessage;
import com.a407.sniffythedog.adapter.in.common.room.message.Vote2ResultMessage;
import com.a407.sniffythedog.adapter.in.common.room.message.Vote2UpdateMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomEventPublisherAdapter implements RoomEventPort {

    // WebSocket/STOMP 메세지 전송 도구
    private final SimpMessagingTemplate messagingTemplate;

    private String topic(String roomCode) {
        return "/topic/rooms/" + roomCode;
    }

    @Override
    public void publishVote1Update(String roomCode, long version, Long userId, boolean hasVoted) {
        Vote1UpdateMessage payload = new Vote1UpdateMessage("VOTE1_UPDATE", version, userId, hasVoted);
        messagingTemplate.convertAndSend(topic(roomCode), payload);
    }

    @Override
    public void publishVote1Result(String roomCode, long version, Long accusedUserId, boolean isTie) {
        Vote1ResultMessage payload = new Vote1ResultMessage("VOTE1_RESULT", version, accusedUserId, isTie);
        messagingTemplate.convertAndSend(topic(roomCode), payload);
    }

    @Override
    public void publishVote2Update(String roomCode, long version, Long userId, boolean hasVoted) {
        Vote2UpdateMessage payload = new Vote2UpdateMessage("VOTE2_UPDATE", version, userId, hasVoted);
        messagingTemplate.convertAndSend(topic(roomCode), payload);
    }

    @Override
    public void publishVote2Result(String roomCode, long version, boolean approved, Long executedUserId, long agree, long disagree) {
        Vote2ResultMessage payload = new Vote2ResultMessage(
                "VOTE2_RESULT",
                version,
                approved,
                executedUserId,
                agree,
                disagree
        );
        messagingTemplate.convertAndSend(topic(roomCode), payload);
    }

    @Override
    public void publishPlayerStatusChanged(String roomCode, long version, Long userId, boolean isAlive, String reason) {
        PlayerStatusChangedMessage payload = new PlayerStatusChangedMessage(
                "PLAYER_STATUS_CHANGED",
                version,
                userId,
                isAlive,
                reason
        );
        messagingTemplate.convertAndSend(topic(roomCode), payload);
    }
}
