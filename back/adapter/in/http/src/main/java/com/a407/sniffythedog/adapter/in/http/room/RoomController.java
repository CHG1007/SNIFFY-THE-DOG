package com.a407.sniffythedog.adapter.in.http.room;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.room.request.CreateRoomRequest;
import com.a407.sniffythedog.adapter.in.http.room.response.CreateRoomResponse;
import com.a407.sniffythedog.application.port.in.room.CreateRoomCommand;
import com.a407.sniffythedog.application.port.in.room.CreateRoomResult;
import com.a407.sniffythedog.application.port.in.room.CreateRoomUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final CreateRoomUseCase createRoomUseCase;

    @PostMapping
    public ApiResponse<CreateRoomResponse> createRoom(@RequestBody @Valid CreateRoomRequest request
                                                      //todo:@Authentication 추가
    ) {
        CreateRoomCommand command = new CreateRoomCommand(
                request.getTitle(),
                request.getCapacity(),
                request.isPrivate(),
                request.getHostUserId(),
                request.getHostDisplayName()
        );

        CreateRoomResult result = createRoomUseCase.createRoom(command);

        CreateRoomResponse response = new CreateRoomResponse(
                result.roomId(),
                result.inviteCode()
        );

        return ApiResponse.success(response);
    }
}
