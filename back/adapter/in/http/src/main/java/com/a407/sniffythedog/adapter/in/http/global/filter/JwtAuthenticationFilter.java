package com.a407.sniffythedog.adapter.in.http.global.filter;

import com.a407.sniffythedog.adapter.in.http.global.jwt.JwtProvider;
import com.a407.sniffythedog.adapter.in.http.global.security.AuthenticatedUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    public JwtAuthenticationFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtProvider.validateToken(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    Long userId = jwtProvider.getUserId(token);
                    String role = jwtProvider.getRole(token);
                    if (role == null || role.isBlank()) {
                        filterChain.doFilter(request, response);
                        return;
                    }
                    List<SimpleGrantedAuthority> authorities = role != null
                        ? List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        : List.of();

                    // Build authentication from token claims and store it in the SecurityContext.
                    AuthenticatedUser principal = new AuthenticatedUser(userId, role);
                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (RuntimeException ignored) {
                    // If token parsing fails, continue without authentication.
                }
            }
        }

        filterChain.doFilter(request, response);
    }
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();

        return uri.startsWith("/v3/api-docs")
                || uri.startsWith("/swagger-ui")
                || uri.equals("/swagger-ui.html")
                || uri.startsWith("/api/v3/api-docs")
                || uri.startsWith("/api/swagger-ui")
                || uri.equals("/api/swagger-ui.html")
                || uri.equals("api/v1/auth/kakao");
    }

}
