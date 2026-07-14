package com.cinema.media_service.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public record AuthenticatedUser(Long id, String email, String role) {

    public static AuthenticatedUser from(HttpServletRequest request) {
        Object value = request.getAttribute(ServiceAuthFilter.AUTH_USER_ATTRIBUTE);
        if (value instanceof AuthenticatedUser user) return user;
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Thiếu thông tin người dùng");
    }

    public boolean isAdminOrStaff() {
        return "ADMIN".equalsIgnoreCase(role) || "STAFF".equalsIgnoreCase(role);
    }

    public boolean owns(Long ownerId) {
        return ownerId != null && ownerId.equals(id);
    }
}
