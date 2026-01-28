package com.a407.sniffythedog.application.gamelog.in;

public interface MyGameLogUseCase {
    MyGameLogResult execute(String roomId, Long userId);
}
