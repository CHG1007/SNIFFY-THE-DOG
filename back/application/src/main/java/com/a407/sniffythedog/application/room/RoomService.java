package com.a407.sniffythedog.application.room;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.room.in.*;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import com.a407.sniffythedog.domain.game.vo.RoomTitle;
import com.a407.sniffythedog.domain.game.entity.PlayerState;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService implements CreateRoomUseCase, GetPublicRoomUseCase, GetRoomByInviteCodeUseCase, GetRoomByRoomIdUseCase {

    private final RedisRoomPort redisRoomPort;

    @Override
    @Transactional
    public CreateRoomResult createRoom(CreateRoomCommand command) {
        RoomId roomId = RoomId.of(UUID.randomUUID().toString());//todo: 추후 openvidu 사용시 세션ID로 변경
        RoomTitle roomTitle = RoomTitle.of(command.title());
        GameUserId hostUserId = GameUserId.of(command.hostUserId());

        RoomSession roomSession = RoomSession.create(
                roomId,
                roomTitle,
                command.isPrivate(),
                command.capacity(),
                hostUserId,
                command.hostDisplayName()
        );

        redisRoomPort.saveRoom(roomSession);

        return new CreateRoomResult(roomId.value(), roomSession.getInviteCode());
    }
    @Override
    @Transactional(readOnly = true)
    public List<GetPublicRoomResult> getPublicRooms(int page, int size) {

        List<RoomSession> sessions = redisRoomPort.loadPublicRooms(page, size);

        return sessions.stream()
                .filter(room -> !room.isPrivate())
                .map(room -> new GetPublicRoomResult(
                        room.getId().value(),
                        room.getTitle().value(),
                        room.getPlayerCount(),
                        room.getCapacity(),
                        room.isPrivate()
                ))
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public GetRoomDetailResult getRoomByRoomId(GetRoomByRoomIdQuery query) {
        RoomId roomId = RoomId.of(query.roomId());

        RoomSession room = redisRoomPort.loadRoom(roomId)
                .orElseThrow(() -> ApplicationException.of(ExceptionType.ROOM_NOT_FOUND));

        return toDetailResult(room);
    }

    @Transactional(readOnly = true)
    public GetRoomDetailResult getRoomByInviteCode(GetRoomByInviteCodeQuery query) {
        String inviteCode = query.inviteCode();

        RoomSession room = redisRoomPort.loadRoomByInviteCode(inviteCode)
                .orElseThrow(() ->  ApplicationException.of(ExceptionType.INVITE_CODE_NOT_FOUND));

        return toDetailResult(room);
    }

    private GetRoomDetailResult toDetailResult(RoomSession room) {
        var players = room.getPlayers().values().stream()
                // 여기서 key : GameUserId , Value : PlayerState
                .map(this::toPlayerItem) // PlayerState를 PlayerItem으로 전부 바꿈
                .toList();

        return new GetRoomDetailResult(
                room.getId().value(),
                room.getTitle().value(),
                room.isPrivate(),
                room.getCapacity(),
                room.getStatus(),
                room.getHostUserId().value(),
                players // PlayerItem이 들어감
        );
    }
    
    // PlayerState 요소 여러개 중에 3개만 뽑아서 PlayerItem을 만듬
    private GetRoomDetailResult.PlayerItem toPlayerItem(PlayerState p) {
        return new GetRoomDetailResult.PlayerItem(
                p.getUserId().value(),
                p.getDisplayName(),
                p.isReady()
        );
    }
}
