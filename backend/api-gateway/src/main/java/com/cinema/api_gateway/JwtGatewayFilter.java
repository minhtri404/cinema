package com.cinema.api_gateway;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class JwtGatewayFilter extends OncePerRequestFilter {

    private static final String BLACKLIST_PREFIX = "auth:blacklist:";

    private final SecretKey key;
    private final StringRedisTemplate redisTemplate;

    public JwtGatewayFilter(@Value("${app.jwt.secret}") String secret, StringRedisTemplate redisTemplate) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            return true;
        }
        return path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/register")
                || path.startsWith("/api/auth/refresh")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = extractBearerToken(request.getHeader(HttpHeaders.AUTHORIZATION));
        if (token == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing bearer token");
            return;
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (claims.getId() != null && Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + claims.getId()))) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been logged out");
                return;
            }

            Map<String, String> headers = new HashMap<>();
            headers.put("X-User-Id", String.valueOf(((Number) claims.get("userId")).longValue()));
            headers.put("X-User-Email", claims.getSubject());
            headers.put("X-User-Role", claims.get("role", String.class));
            headers.put("X-User-FullName", String.valueOf(claims.get("fullName")));

            filterChain.doFilter(new HeaderRequestWrapper(request, headers), response);
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

    private static class HeaderRequestWrapper extends HttpServletRequestWrapper {
        private final Map<String, String> headers;

        HeaderRequestWrapper(HttpServletRequest request, Map<String, String> headers) {
            super(request);
            this.headers = headers;
        }

        @Override
        public String getHeader(String name) {
            String header = headers.get(name);
            return header != null ? header : super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            String header = headers.get(name);
            if (header != null) {
                return Collections.enumeration(List.of(header));
            }
            return super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            List<String> names = new ArrayList<>();
            Enumeration<String> originalNames = super.getHeaderNames();
            while (originalNames.hasMoreElements()) {
                names.add(originalNames.nextElement());
            }
            names.addAll(headers.keySet());
            return Collections.enumeration(names);
        }
    }
}
