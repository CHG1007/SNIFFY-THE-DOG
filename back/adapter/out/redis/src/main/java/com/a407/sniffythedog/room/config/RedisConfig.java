package com.a407.sniffythedog.room.config;

import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.room.mapper.RoomMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@Configuration
@EnableRedisRepositories(basePackages = "com.a407.sniffythedog")
public class RedisConfig {

    @Bean
    public RoomMapper roomMapper() {
        // 1. Room 기능 전용 ObjectMapper 생성 (다른 기능에 영향 X)
        ObjectMapper mapper = new ObjectMapper();

        // 날짜 지원
        mapper.registerModule(new JavaTimeModule());

        // 타입 정보 활성화 (Redis 저장 시 필요)
        mapper.activateDefaultTyping(
                mapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL
        );

        // [핵심] GameUserId 변환기 등록
        SimpleModule module = new SimpleModule();
        module.addKeyDeserializer(GameUserId.class, new GameUserIdKeyDeserializer());
        mapper.registerModule(module);

        // 2. 특수 설정된 mapper를 주입해서 RoomMapper 생성
        return new RoomMapper(mapper);
    }
}