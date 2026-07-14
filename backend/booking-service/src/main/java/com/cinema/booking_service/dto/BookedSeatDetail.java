package com.cinema.booking_service.dto;

import java.math.BigDecimal;

public record BookedSeatDetail(
        Long seatId,
        String seatCode,
        BigDecimal price,
        Long bookingId,
        String bookingStatus,
        Long userId,
        String customerName,
        String customerEmail
) {
}
