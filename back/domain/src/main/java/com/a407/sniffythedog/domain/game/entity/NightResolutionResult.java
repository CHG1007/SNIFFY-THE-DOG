package com.a407.sniffythedog.domain.game.entity;

import com.a407.sniffythedog.domain.game.vo.GameUserId;

// RESOLVER에서 계산한 결과를 담는 그릇이라고 생각하자 (  record )
// 아무도 안 죽음(마피아 확정 없음 등) , 의사가 막아서 안 죽음, 누군가 죽음
public record NightResolutionResult(GameUserId killedUserId, boolean saved) {
}
