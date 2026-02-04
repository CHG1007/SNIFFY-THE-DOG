package com.a407.sniffythedog.application.night.out;

import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.vo.GameUserId;

import java.time.Instant;

public interface NightEventPort {

    // 98: 마피아 타겟 확정 (마피아 채널)
    void mafiaTargetLocked(String roomCode, String requestId, long version, GameUserId targetUserId);

    // 99: 경찰 개인 결과 (경찰 유저에게만 전송)
    void policeResult(String roomCode, String requestId, GameUserId toPolice, GameUserId targetUserId, boolean isMafia);

    // 밤 정산 결과 (누가 죽었는지/살았는지 - 방 전체)
    void nightResolved(String roomCode, String requestId, long version, GameUserId killedUserId, boolean saved);

    // 플레이어 상태 변경 (사망 처리 등 - 방 전체)
    void playerStatusChanged(String roomCode, String requestId, long version, GameUserId userId, boolean isAlive, String reason);

    // 페이즈 변경 (타이머 동기화 - 방 전체)
    void phaseChanged(String roomCode, String requestId, long version, Phase phase, Instant phaseEndsAt);
}

