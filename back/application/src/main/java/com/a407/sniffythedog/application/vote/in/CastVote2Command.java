package com.a407.sniffythedog.application.vote.in;

import com.a407.sniffythedog.domain.game.enums.YesNo;

// 2차 투표 ( 찬반 투표 ) 요청 1건을 표현하는 데이터
public record CastVote2Command(
        String roomCode, Long voterUserId, YesNo vote) {}

// roomCode : 어느 방에서 진행되는 2차 투표
// voterUserId : 누가 2차 투표를 했는지
// vote : YES OR NO 로 처형 찬/반