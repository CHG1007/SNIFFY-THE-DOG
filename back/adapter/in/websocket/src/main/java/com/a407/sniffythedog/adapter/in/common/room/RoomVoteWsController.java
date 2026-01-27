package com.a407.sniffythedog.adapter.in.common.room;

import com.a407.sniffythedog.application.vote.in.CastVote1Command;
import com.a407.sniffythedog.application.vote.in.CastVote1UseCase;
import com.a407.sniffythedog.application.vote.in.CastVote2Command;
import com.a407.sniffythedog.application.vote.in.CastVote2UseCase;
import com.a407.sniffythedog.domain.game.enums.YesNo;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class RoomVoteWsController {

    private final CastVote1UseCase castVote1UseCase;
    private final CastVote2UseCase castVote2UseCase;

    @MessageMapping("/rooms/{roomCode}/vote1/cast")

    public void vote1Cast(@DestinationVariable String roomCode, Vote1CastRequest request, Principal principal) {
        Long  voterUserId = Long.valueOf(principal.getName()); // 서버에서 투표한 사람 뽑기
        // roomCode를 뽑아오고 , 사버의 투표한 사람 ( 클라이언트에서 안뽑는 이유 : 보안 )  , 투표 받은 사람 뽑아오기
        castVote1UseCase.execute(new CastVote1Command(
                roomCode,
                voterUserId,
                request.targetUserId()
        ));
    }

    public record Vote1CastRequest(Long targetUserId) {}

    // 2차 투표(찬반)
    @MessageMapping("/rooms/{roomCode}/vote2/cast")
    public void vote2Cast(@DestinationVariable String roomCode, Vote2CastRequest request, Principal principal) {

        Long voterUserId = Long.valueOf(principal.getName());

        YesNo vote = request.agree()? YesNo.YES : YesNo.NO;

        castVote2UseCase.execute(new CastVote2Command(
                roomCode,
                voterUserId,
                vote
        ));
    }

    // 클라이언트는 agree만 보낸다
    public record Vote2CastRequest(Boolean agree) {}
}
