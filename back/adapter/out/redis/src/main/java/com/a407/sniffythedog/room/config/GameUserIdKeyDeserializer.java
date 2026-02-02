package com.a407.sniffythedog.room.config;

import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.KeyDeserializer;

import java.io.IOException;

public class GameUserIdKeyDeserializer extends KeyDeserializer {

    @Override
    public Object deserializeKey(String key, DeserializationContext ctxt) throws IOException {
        // Redis에서 읽어온 문자열 Key("123")를 -> GameUserId 객체로 변환
        return GameUserId.of(Long.parseLong(key));
    }
}
