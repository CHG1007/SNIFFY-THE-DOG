package com.a407.sniffythedog.adapter.in.common.interceptor;

import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class SocketChannelInterceptor implements ChannelInterceptor {

    //todo: jwtsecret 변경
    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey key;

    private final RedisRoomPort redisRoomPort;

    // 방 코드를 추출하기 위한 정규식 (/topic/rooms/{roomCode}/mafia)
    private static final Pattern MAFIA_TOPIC_PATTERN = Pattern.compile(".*/rooms/(.+)/mafia");

    @PostConstruct
    public void init() {
        // 키 객체 생성 비용을 줄이기 위해 초기화 시 한 번만 생성
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

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

        token = token.substring(7);

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(this.key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userIdStr = claims.getSubject();

            List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
            Authentication auth = new UsernamePasswordAuthenticationToken(userIdStr, null, authorities);

            accessor.setUser(auth);
            log.info("WebSocket Connected: User ID {}", userIdStr);

        } catch (JwtException | IllegalArgumentException e) {
            log.error("WebSocket Token Validation Failed: {}", e.getMessage());
            // 이 예외는 클라이언트에게 STOMP ERROR 프레임으로 전달되고 연결이 종료됩니다.
            throw new IllegalArgumentException("Invalid JWT token: " + e.getMessage());
        }
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) return;

        Matcher matcher = MAFIA_TOPIC_PATTERN.matcher(destination);
        if (matcher.matches()) {
            String roomCode = matcher.group(1);
            Authentication auth = (Authentication) accessor.getUser();
            validateMafiaSubscription(auth, roomCode);
        }
    }

    private void validateMafiaSubscription(Authentication user, String roomCode) {
        //todo: 마피아 구독 검증 로직 작성
    }





}
