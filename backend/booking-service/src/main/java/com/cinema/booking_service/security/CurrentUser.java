package com.cinema.booking_service.security;

public record CurrentUser(Long id, String email, String role) {

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }

    public boolean isStaff() {
        return "STAFF".equals(role);
    }

    public boolean canManageBookings() {
        return isAdmin() || isStaff();
    }

    public boolean owns(Long ownerId) {
        return ownerId != null && ownerId.equals(id);
    }
}
