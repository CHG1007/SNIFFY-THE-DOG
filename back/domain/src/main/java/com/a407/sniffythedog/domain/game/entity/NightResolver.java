package com.a407.sniffythedog.domain.game.entity;

import com.a407.sniffythedog.domain.game.entity.NightResolutionResult;
import com.a407.sniffythedog.domain.game.entity.RoomNightState;
import com.a407.sniffythedog.domain.game.vo.GameUserId;

/**
 * 밤 정산 규칙
 * 규칙:
 * 1) 마피아 확정 타겟이 없으면 아무도 안 죽음
 * 2) 의사 보호 대상이 마피아 타겟과 같으면 saved=true, killed=null
 * 3) 아니면 killed=마피아 타겟
 */
public class NightResolver {

    public NightResolutionResult resolve(RoomNightState nightState) {
        GameUserId mafiaTarget = nightState.getMafiaLockedTarget();
        if (mafiaTarget == null) {
            return new NightResolutionResult(null, false);
        }

        GameUserId doctorTarget = nightState.getDoctorTarget();
        if (doctorTarget != null && doctorTarget.equals(mafiaTarget)) {
            return new NightResolutionResult(null, true);
        }

        return new NightResolutionResult(mafiaTarget, false);
    }
}
