package com.a407.sniffythedog.adapter.in.http.room;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.global.security.AuthenticatedUser;
import com.a407.sniffythedog.adapter.in.http.room.request.CreateRoomRequest;
import com.a407.sniffythedog.adapter.in.http.room.response.CreateRoomResponse;
import com.a407.sniffythedog.adapter.in.http.room.response.RoomSummaryResponse;
import com.a407.sniffythedog.application.room.in.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final CreateRoomUseCase createRoomUseCase;
    private final GetPublicRoomUseCase getAllRoomUseCase;
    private final GetRoomByInviteCodeUseCase getRoomByInviteCodeUseCase;
    private final GetRoomByRoomIdUseCase getRoomByRoomIdUseCase;

    @PostMapping
    public ApiResponse<CreateRoomResponse> createRoom(
            @RequestBody @Valid CreateRoomRequest request,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {

        CreateRoomCommand command = new CreateRoomCommand(
                request.getTitle(),
                request.getCapacity(),
                request.isPrivate(),
                user.userId(),
                request.getHostDisplayName()
        );

        CreateRoomResult result = createRoomUseCase.createRoom(command);

        CreateRoomResponse response = new CreateRoomResponse(
                result.roomId(),
                result.inviteCode()
        );

        return ApiResponse.success(response);
    }

    @GetMapping()
    public ApiResponse<List<RoomSummaryResponse>> getRoomInfo(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
            //todo:@Authentication 추가
    ) {
        List<GetPublicRoomResult> results = getAllRoomUseCase.getPublicRooms(page, size);

        List<RoomSummaryResponse> response = results.stream()
                .map(result -> RoomSummaryResponse.builder()
                        .roomId(result.roomId())
                        .title(result.title())
                        .currentCount(result.currentCount())
                        .capacity(result.capacity())
                        .isPrivate(result.isPrivate())
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.success(response);
    }
    // inviteCode가 있을 때만 이 메서드가 매칭됨
    @GetMapping(params = "inviteCode")
    public ApiResponse<GetRoomDetailResult> getRoomByInviteCode(
            @RequestParam String inviteCode
            //todo:@Authentication 추가
    ) {
        GetRoomDetailResult result =
                getRoomByInviteCodeUseCase.getRoomByInviteCode(new GetRoomByInviteCodeQuery(inviteCode));

        return ApiResponse.success(result);
    }

    @GetMapping("/{roomId}")
    public ApiResponse<GetRoomDetailResult> getRoomDetail(@PathVariable String roomId) {
        GetRoomDetailResult result =
                getRoomByRoomIdUseCase.getRoomByRoomId(new GetRoomByRoomIdQuery(roomId));
        return ApiResponse.success(result);
    }
}
