package com.a407.sniffythedog.application.vote.in;

// 1차 투표를 처리할 수 있는 기능이 있다는 인터페이스
public interface CastVote1UseCase {
    void execute(CastVote1Command command);
}
