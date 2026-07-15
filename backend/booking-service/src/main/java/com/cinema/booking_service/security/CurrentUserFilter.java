package com.cinema.booking_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CurrentUserFilter extends OncePerRequestFilter {

    public static final String CURRENT_USER_ATTRIBUTE = "currentUser";

    private final JwtService jwtService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui")
                || isPublicReadEndpoint(request, path);
    }

    private boolean isPublicReadEndpoint(HttpServletRequest request, String path) {
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        return path.startsWith("/api/foods")
                || (path.startsWith("/api/bookings/showtime/") && path.endsWith("/booked-seats"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        CurrentUser currentUser = fromForwardedHeaders(request);
        if (currentUser == null) {
            String token = extractBearerToken(request.getHeader(HttpHeaders.AUTHORIZATION));
            if (token != null) {
                try {
                    currentUser = jwtService.parseCurrentUser(token);
                } catch (Exception ignored) {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid bearer token");
                    return;
                }
            }
        }

        if (currentUser == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing authenticated user");
            return;
        }

        request.setAttribute(CURRENT_USER_ATTRIBUTE, currentUser);
        filterChain.doFilter(request, response);
    }

    private CurrentUser fromForwardedHeaders(HttpServletRequest request) {
        String userId = request.getHeader("X-User-Id");
        String role = request.getHeader("X-User-Role");
        String email = request.getHeader("X-User-Email");
        if (userId == null || role == null) {
            return null;
        }
        return new CurrentUser(Long.valueOf(userId), email, role);
    }

    private String extractBearerToken(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
}
