package com.cinema.payment_service.dto;

import java.math.BigDecimal;

public record CreatePaymentRequest(
        Long bookingId,
        Long userId,
        BigDecimal amount,
        String provider,
        String paymentMethod,
        String description
) {}
