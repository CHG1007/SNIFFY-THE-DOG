package com.a407.sniffythedog.domain.gamelog.enums;

public enum GameEventType {
    MAFIA_TARGET, // 마피아가 누구를 타겟!
    DOCTOR_SAVE, //의사가 누굴 살릴지
    POLICE_CHECK, // 경찰이 누구를 조사
    KILL, // 밤에 실제 죽은 사람
    EXECUTE, // 투표로 처형된 사람
    NIGHT_RESOLVE, // 밤에 일어난 선택 최종 확정 ( ex. 마피아가 죽이고 의사 살릴 때 )
    PHASE_CHANGED, // 낮과 밤 체인지
    GAME_FINISHED, // 게임 종료
    VOTE1_CAST, // 1차 투표에서 누가 누구를 찍었는지
    VOTE1_RESULT, // 1차 투표 결과
    VOTE2_CAST, // 2차 투표에서 누가 누구를 뽑았는지
    VOTE2_RESULT // 2차 투표 결과
}
