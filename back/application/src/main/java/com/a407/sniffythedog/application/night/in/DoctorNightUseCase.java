package com.a407.sniffythedog.application.night.in;

public interface DoctorNightUseCase {
    void selectDoctor(String roomCode, long doctorUserId, long targetUserId);
}
