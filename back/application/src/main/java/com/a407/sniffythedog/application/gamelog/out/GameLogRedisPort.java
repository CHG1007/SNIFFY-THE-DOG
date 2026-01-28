package com.a407.sniffythedog.application.gamelog.out;

import com.a407.sniffythedog.domain.gamelog.entity.GameLog;
import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import com.a407.sniffythedog.domain.gamelog.vo.PlayerResult;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface GameLogRedisPort {
    /**
     * 게임 시작 시 로그 초기화 (참여자 목록, 시작 시간 저장)
     */
    void initGameLog(String roomId, List<PlayerResult> players, Instant startedAt);

    /**
     * 게임 중 발생하는 이벤트 저장 (투표, 킬, 스킬 등)
     */
    void saveEvent(String roomId, GameEvent event);

    /**
     * 게임 종료 후 Redis에 저장된 데이터를 모아 GameLog 도메인 객체로 복원
     */
    Optional<GameLog> loadGameLog(String roomId);

    /**
     * 로그 데이터 삭제 (DB 이관 후 정리)
     */
    void deleteGameLog(String roomId);
}
