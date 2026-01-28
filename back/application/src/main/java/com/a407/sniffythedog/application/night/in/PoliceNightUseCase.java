package com.a407.sniffythedog.application.night.in;

public interface PoliceNightUseCase {
    void selectPolice(String roomCode, long policeUserId, long targetUserId);
}
