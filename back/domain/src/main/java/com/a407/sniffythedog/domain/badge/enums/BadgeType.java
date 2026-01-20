package com.a407.sniffythedog.domain.badge.enums;

public enum BadgeType {
    // 승리왕
    WINNER_1("첫 승리", "첫 번째 승리를 달성했습니다", "게임에서 1회 승리"),
    WINNER_10("10승 달성", "10번의 승리를 달성했습니다", "게임에서 10회 승리"),
    WINNER_50("50승 달성", "50번의 승리를 달성했습니다", "게임에서 50회 승리"),
    WINNER_100("100승 달성", "100번의 승리를 달성했습니다", "게임에서 100회 승리"),

    // 시간의 방
    PLAYTIME_1H("1시간 플레이", "총 1시간 플레이했습니다", "누적 플레이 시간 1시간"),
    PLAYTIME_10H("10시간 플레이", "총 10시간 플레이했습니다", "누적 플레이 시간 10시간"),
    PLAYTIME_50H("50시간 플레이", "총 50시간 플레이했습니다", "누적 플레이 시간 50시간"),

    // 직업 마스터
    MAFIA_MASTER("타고난 연기자", "마피아로 10회 승리했습니다", "마피아로 10회 승리"),
    POLICE_MASTER("명탐정", "경찰로 10회 승리했습니다", "경찰로 10회 승리"),
    DOCTOR_MASTER("슈바이처", "의사로 10회 승리했습니다", "의사로 10회 승리");

    private final String name;
    private final String description;
    private final String condition;

    BadgeType(String name, String description, String condition) {
        this.name = name;
        this.description = description;
        this.condition = condition;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getCondition() {
        return condition;
    }
}
