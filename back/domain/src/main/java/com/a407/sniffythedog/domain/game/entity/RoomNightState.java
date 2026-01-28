package com.a407.sniffythedog.domain.game.entity;

import com.a407.sniffythedog.domain.game.vo.GameUserId;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

// 밤에 들어온 액션을 모두 모아두는 상태 ( 마피아 , 경찰 , 의사 )
public class RoomNightState{

    // mafiaUserId -> targetUserId 기록함 key가 마피아유저 , value는 타겟 유저를 의미함
    private final Map<GameUserId, GameUserId> mafiaProposals = new HashMap<>();

    // 최종 확정 타겟 -> 이 사람 죽이겠다는거 타겟 정함
    private GameUserId mafiaLockedTarget;

    // 의사 보호 대상
    private GameUserId doctorTarget;

    // policeUserId -> targetUserId  조사한 사람 기록
    private final Map<GameUserId, GameUserId> policeChecks = new HashMap<>();

    // 최종 확정 타겟 외부에서 읽기 가능
    public Map<GameUserId, GameUserId> getMafiaProposals() {
        return mafiaProposals;
    }

    public GameUserId getMafiaLockedTarget() {
        return mafiaLockedTarget;
    }

    public void proposeMafiaTarget(GameUserId mafiaUserId, GameUserId targetUserId) {
        Objects.requireNonNull(mafiaUserId);
        Objects.requireNonNull(targetUserId);
        mafiaProposals.put(mafiaUserId, targetUserId);
    }

    public void lockMafiaTarget(GameUserId targetUserId) {
        Objects.requireNonNull(targetUserId);
        this.mafiaLockedTarget = targetUserId;
    }

    public GameUserId getDoctorTarget() {
        return doctorTarget;
    }

    public void setDoctorTarget(GameUserId doctorTarget) {
        Objects.requireNonNull(doctorTarget);
        this.doctorTarget = doctorTarget;
    }

    public Map<GameUserId, GameUserId> getPoliceChecks() {
        return policeChecks;
    }

    public void recordPoliceCheck(GameUserId policeUserId, GameUserId targetUserId) {
        Objects.requireNonNull(policeUserId);
        Objects.requireNonNull(targetUserId);
        policeChecks.put(policeUserId, targetUserId);
    }

    //  밤 종료후 초기화
    public void reset() {
        mafiaProposals.clear();
        mafiaLockedTarget = null;
        doctorTarget = null;
        policeChecks.clear();
    }
}
