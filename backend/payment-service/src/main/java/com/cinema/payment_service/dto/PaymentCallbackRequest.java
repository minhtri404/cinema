package com.cinema.payment_service.dto;

public record PaymentCallbackRequest(
        String transactionReference,
        String providerTransactionId,
        String status,
        String rawPayload
) {}
