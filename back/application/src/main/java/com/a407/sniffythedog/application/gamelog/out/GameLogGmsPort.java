package com.a407.sniffythedog.application.gamelog.out;

import java.util.List;

public interface GameLogGmsPort {
    // 플레이어의 정보와 로그를 받아 리포트 반환
    String generateReport(List<String> playerInfos, List<String> eventTexts);
}
