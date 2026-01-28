package com.a407.sniffythedog.adapter.in.common.interceptor;

import com.a407.sniffythedog.adapter.in.http.global.jwt.JwtProvider;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class SocketChannelInterceptor implements ChannelInterceptor {


    private final JwtProvider jwtProvider;

    private final RedisRoomPort redisRoomPort;

    // 방 코드를 추출하기 위한 정규식 (/topic/rooms/{roomCode}/mafia)
    private static final Pattern MAFIA_TOPIC_PATTERN = Pattern.compile(".*/rooms/(.+)/mafia");


    /**
     * 클라이언트가 서버에 메세지를 보낼 때마다 실행
     * CONNECT -> 처음 웹소켓에 연결할때 토큰 검증
     * SUBSCRIBE -> 마피아 체널 구독 검증
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        // 1. 연결 시 토큰 검증 (CONNECT)
        if (StompCommand.CONNECT.equals(command)) {
            handleConnect(accessor);
        }
        // 2. 구독 권한 검증 (SUBSCRIBE)
        else if (StompCommand.SUBSCRIBE.equals(command)) {
            handleSubscribe(accessor);
        }

        return message;
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        String token = accessor.getFirstNativeHeader("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            log.error("WebSocket Connection Failed: Missing Authorization header");
            throw new IllegalArgumentException("Authorization header is missing or invalid");
        }

        String jwt = token.substring(7);

        // JwtProvider를 사용하여 토큰 검증
        if (!jwtProvider.validateToken(jwt)) {
            log.error("WebSocket Token Validation Failed: Invalid Token");
            throw new IllegalArgumentException("Invalid JWT token");
        }

        try {
            // JwtProvider를 사용하여 정보 추출
            Long userId = jwtProvider.getUserId(jwt);
            String role = jwtProvider.getRole(jwt); // JwtProvider에 getRole 메서드가 있다고 가정 (코드상 존재함)

            // Principal 생성 (userId를 Principal 이름으로 사용)
            // 역할(Role)이 있다면 Authorities에 추가
            List<SimpleGrantedAuthority> authorities = (role != null)
                    ? Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    : Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));

            Authentication auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);

            accessor.setUser(auth);
            log.info("WebSocket Connected: User ID {}", userId);

        } catch (Exception e) {
            log.error("WebSocket Authentication Error: {}", e.getMessage());
            throw new IllegalArgumentException("Authentication failed: " + e.getMessage());
        }
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) return;

        Matcher matcher = MAFIA_TOPIC_PATTERN.matcher(destination);
        if (matcher.matches()) {
            String roomCode = matcher.group(1);
            Authentication auth = (Authentication) accessor.getUser();

            if (auth == null) {
                throw new IllegalArgumentException("Unauthenticated user trying to subscribe");
            }

            validateMafiaSubscription(auth, roomCode);
        }
    }

    private void validateMafiaSubscription(Authentication user, String roomCode) {
        Long userId = Long.parseLong(user.getName());

        // 1. Redis에서 현재 방 정보 조회
        RoomSession room = redisRoomPort.loadRoom(RoomId.of(roomCode))
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomCode));

        // 2. 플레이어 정보 확인
        PlayerState player = room.getPlayer(GameUserId.of(userId));
        if (player == null) {
            throw new IllegalArgumentException("User is not a participant of room: " + roomCode);
        }

        // 3. 마피아 여부 검증
        if (!player.isMafia()) {
            log.warn("Security Alert: User {} tried to subscribe mafia channel without permission.", userId);
            throw new IllegalArgumentException("Access Denied: You are not a Mafia.");
        }
    }

}
