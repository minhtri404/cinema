package com.cinema.booking_service.dto;

import java.math.BigDecimal;

public record SeatLockInfo(
        Long seatId,
        String seatCode,
        BigDecimal price,
        Long bookingId,
        String bookingStatus,
        boolean heldByCurrentUser
) {
}
