package com.a407.sniffythedog.application.vote.in;

// 투표 요청 데이터 ( 어느방에서 , 누가 투표 했는지 , 누구를 찍었는지 )
public record CastVote1Command(
        String roomCode,
        Long voterUserId,
        Long targetUserId
) {}
