package com.a407.sniffythedog.domain.gamelog.enums;

public enum GameEventType {
    DAY_VOTE,
    FINAL_VOTE,
    MAFIA_TARGET,
    DOCTOR_SAVE,
    POLICE_CHECK,
    KILL,
    EXECUTE,
    NIGHT_RESOLVE, // 밤에 일어난 선택 최종 확정 ( ex. 마피아가 죽이고 의사 살릴 때 )
    PHASE_CHANGED,
    GAME_FINISHED
}
