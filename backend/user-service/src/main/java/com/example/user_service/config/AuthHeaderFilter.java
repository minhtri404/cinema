package com.example.user_service.config;

import com.example.user_service.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthHeaderFilter extends OncePerRequestFilter {

    private static final String BLACKLIST_PREFIX = "auth:blacklist:";

    private final JwtService jwtService;
    private final StringRedisTemplate redisTemplate;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/users")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String forwardedUserId = request.getHeader("X-User-Id");
        String forwardedRole = request.getHeader("X-User-Role");

        if (forwardedUserId != null && forwardedRole != null) {
            request.setAttribute("userId", Long.valueOf(forwardedUserId));
            request.setAttribute("role", forwardedRole);
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractBearerToken(request.getHeader(HttpHeaders.AUTHORIZATION));
        if (token == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing bearer token");
            return;
        }

        try {
            Claims claims = jwtService.parseClaims(token);
            if (claims.getId() != null && Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + claims.getId()))) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been logged out");
                return;
            }
            request.setAttribute("userId", claims.get("userId", Long.class));
            request.setAttribute("role", claims.get("role", String.class));
            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid bearer token");
        }
    }

    private String extractBearerToken(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
}
