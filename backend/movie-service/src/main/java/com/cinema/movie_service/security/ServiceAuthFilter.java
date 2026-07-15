package com.cinema.movie_service.security;

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

    private final SecretKey key;

    public ServiceAuthFilter(@Value("${app.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/")
                || isPublicReadEndpoint(request, path)
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui");
    }

    private boolean isPublicReadEndpoint(HttpServletRequest request, String path) {
        return "GET".equalsIgnoreCase(request.getMethod())
                && path.startsWith("/api/movies");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (request.getHeader("X-User-Id") != null && request.getHeader("X-User-Role") != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractBearerToken(request.getHeader(HttpHeaders.AUTHORIZATION));
        if (token == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing authenticated user");
            return;
        }

        try {
            Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            request.setAttribute("userId", ((Number) claims.get("userId")).longValue());
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
