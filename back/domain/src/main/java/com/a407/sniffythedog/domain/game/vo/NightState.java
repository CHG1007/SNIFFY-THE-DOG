package com.a407.sniffythedog.domain.game.vo;

public record NightState(
        GameUserId mafiaTargetUserId,
        GameUserId policeTargetUserId,
        GameUserId doctorTargetUserId
) {

    public static NightState empty() {
        return new NightState(null, null, null);
    }

    public NightState withMafiaTarget(GameUserId target) {
        return new NightState(target, policeTargetUserId, doctorTargetUserId);
    }

    public NightState withPoliceTarget(GameUserId target) {
        return new NightState(mafiaTargetUserId, target, doctorTargetUserId);
    }

    public NightState withDoctorTarget(GameUserId target) {
        return new NightState(mafiaTargetUserId, policeTargetUserId, target);
    }

    public boolean isMafiaTargetSaved() {
        return mafiaTargetUserId != null
                && doctorTargetUserId != null
                && mafiaTargetUserId.equals(doctorTargetUserId);
    }
}
