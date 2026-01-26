package com.a407.sniffythedog.application.game.out;

public interface GameMessagePort {
    // 방 전체 브로드캐스트 (requestId 불필요 또는 내부 생성)
    void sendToRoom(String roomCode, String type, Object payload);
    // 개인 메시지 전송 (requestId 필수 - 요청에 대한 응답용)
    void sendToUser(String userId, String roomCode, String requestId, String type, Object payload);
    // 마피아 채널 전송
    void sendToMafia(String roomCode, String type, Object payload);
}
