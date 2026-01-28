package com.a407.sniffythedog.application.night.out;

import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.vo.GameUserId;

import java.time.Instant;

public interface NightEventPort {

    // 98: 마피아 채널
    void mafiaTargetLocked(String roomCode, long version, GameUserId targetUserId);

    // 99: 경찰 개인 결과 ( 방, 경찰유저, 조사한 대상 , 조사 결과 )
    void policeResult(String roomCode, GameUserId toPolice, GameUserId targetUserId, boolean isMafia);

    // 밤 정산 결과 ( 방코드 , version, 누가 죽었는지 , 살았는지 ) -> 밤 결과 발표
    void nightResolved(String roomCode, long version, GameUserId killedUserId, boolean saved);

    // 플레이어 상태 변경 : 밤 정산 결과와 같을 수 있지만 , 프론트 처리 깔끔하게 하기 위해서 메서드 분리 -> 데이터 상태 변경 발표
    void playerStatusChanged(String roomCode, long version, GameUserId userId, boolean isAlive, String reason);

    // 페이즈 변경 : 페이즈, 프론트 타이머 ( 카운트 다운 )
    void phaseChanged(String roomCode, long version, Phase phase, Instant phaseEndsAt);
}
