package com.cinema.notification_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class ServiceAuthFilter extends OncePerRequestFilter {

    public static final String AUTH_USER_ATTRIBUTE = "authenticatedUser";
    private final SecretKey key;

    public ServiceAuthFilter(@Value("${app.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        AuthenticatedUser user;
        try {
            user = fromForwardedHeaders(request);
            if (user == null) user = fromBearerToken(request.getHeader(HttpHeaders.AUTHORIZATION));
        } catch (Exception ex) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid authentication data");
            return;
        }
        if (user == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing authenticated user");
            return;
        }
        request.setAttribute(AUTH_USER_ATTRIBUTE, user);
        chain.doFilter(request, response);
    }

    private AuthenticatedUser fromForwardedHeaders(HttpServletRequest request) {
        String id = request.getHeader("X-User-Id");
        String role = request.getHeader("X-User-Role");
        if (id == null || role == null) return null;
        return new AuthenticatedUser(Long.valueOf(id), request.getHeader("X-User-Email"), role);
    }

    private AuthenticatedUser fromBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(authorization.substring(7)).getPayload();
        return new AuthenticatedUser(
                ((Number) claims.get("userId")).longValue(),
                claims.getSubject(),
                claims.get("role", String.class)
        );
    }
}
