package com.cinema.payment_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "booking-service")
public interface BookingClient {

    @PutMapping("/api/bookings/{id}/client-pay")
    Object markClientPaid(
            @PathVariable("id") Long bookingId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Email") String email,
            @RequestBody BookingPaymentRequest request
    );

    record BookingPaymentRequest(String paymentMethod, String transactionCode) {
    }
}
