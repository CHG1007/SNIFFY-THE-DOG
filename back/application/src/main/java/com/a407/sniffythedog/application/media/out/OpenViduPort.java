package com.a407.sniffythedog.application.media.out;

public interface OpenViduPort {

    /**
     * OpenVidu 세션을 생성하거나 기존 세션을 반환합니다.
     *
     * @param sessionId 세션 식별자 (roomId)
     * @return 생성된 세션 ID
     */
    String createSession(String sessionId);

    /**
     * 세션에 연결할 수 있는 토큰을 생성합니다.
     *
     * @param sessionId 세션 식별자
     * @param userId    사용자 식별자
     * @return OpenVidu 연결 토큰
     */
    String createToken(String sessionId, String userId);
}
