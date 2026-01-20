package com.a407.sniffythedog.application.service.room;

import com.a407.sniffythedog.application.port.in.room.CreateRoomCommand;
import com.a407.sniffythedog.application.port.in.room.CreateRoomResult;
import com.a407.sniffythedog.application.port.in.room.CreateRoomUseCase;
import com.a407.sniffythedog.application.port.out.room.RoomPort;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import com.a407.sniffythedog.domain.game.vo.RoomTitle;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService implements CreateRoomUseCase {

    private final RoomPort roomPort;

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

        roomPort.saveRoom(roomSession);

        return new CreateRoomResult(roomId.value(), roomSession.getInviteCode());
    }
}
