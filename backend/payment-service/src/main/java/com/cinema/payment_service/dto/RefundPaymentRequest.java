package com.cinema.payment_service.dto;

import java.math.BigDecimal;

public record RefundPaymentRequest(BigDecimal amount) {}
