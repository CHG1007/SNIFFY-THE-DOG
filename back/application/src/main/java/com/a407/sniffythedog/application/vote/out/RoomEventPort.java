package com.a407.sniffythedog.application.vote.out;

import com.a407.sniffythedog.application.game.in.RoomState;

import java.util.List;

// 방에 무슨 일이 일어났을 때 , 외부에 알리는 것 !
public interface RoomEventPort {

    record PlayerRoleInfo(Long userId, String nickname, String role) {}
    // 1차 투표 진행 ( 방코드 , 버전 , 누가 투표 했는지 , 투표 O/X )0
    void publishVote1Update(String roomCode, long version, Long userId, boolean hasVoted);

    // 1차 투표 결과 ( 방코드, 버전, 가장많이지목된사람,동점여부)
    void publishVote1Result(String roomCode, long version, Long accusedUserId, boolean isTie);

    // 2차 투표 진행 ( 방코드, 버전, 찬반 투표한 사람 , 투표 완료 했는지 )
    void publishVote2Update(String roomCode, long version, Long userId, boolean hasVoted);

    // 2차 투표 결과( 방 , 버전 , 처형 승인 ? , 실제 처형 대상 , 찬/반 )
    void publishVote2Result(String roomCode, long version, boolean approved, Long executedUserId, long agree, long disagree);

    // 처형/사망 상태 변경 알림 ( 어느방 , 버전 , 상태가 바뀐 플레이어, 생존 여부 , 왜 상태가 바뀌었는지 )
    void publishPlayerStatusChanged(String roomCode, long version, Long userId, boolean isAlive, String reason);

    // 게임 결과
    void publishGameFinished(String roomCode, long version, String winnerTeam, Long mvpUserId, List<PlayerRoleInfo> players);

    // 나간 사람들 알려주는것
    void publishRoomPlayerLeft(String roomCode, long version, Long userId, RoomState roomState);

}

