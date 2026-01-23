package com.a407.sniffythedog.adapter.in.http.config;

import com.a407.sniffythedog.adapter.in.http.global.filter.JwtAuthenticationFilter;
import com.a407.sniffythedog.application.global.jwt.JwtProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {
        http
                // 1. [핵심] CSRF, FormLogin, HttpBasic 모두 끄기
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable) // 로그인 페이지 리다이렉트 방지
                .httpBasic(AbstractHttpConfigurer::disable) // 브라우저 팝업 방지

                // 2. [핵심] 세션 끄기 (API 서버는 세션을 안 씁니다)
                // 이걸 끄면 jsessionid=... 가 더 이상 안 생깁니다.
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 3. CORS 적용
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 4. [핵심] 리다이렉트 절대 금지 (에러나면 그냥 401 뱉어라!)
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )

                // 5. JWT 인증 필터 적용
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // 5. 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 1. [구체적인 규칙] 로그아웃은 인증해야 함
                        .requestMatchers("/api/v1/auth/logout").authenticated()
                        // 프론트엔드 URL (/api/v1/auth/kakao) 허용
                        // 2. [넓은 규칙] 나머지 auth는 다 허용
                        .requestMatchers("/api/v1/auth/**", "/api/auth/**").permitAll()
                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtProvider jwtProvider) {
        return new JwtAuthenticationFilter(jwtProvider);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 프론트엔드 주소 (Vite)
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
