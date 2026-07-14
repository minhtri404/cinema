package com.cinema.payment_service.controller;

import com.cinema.payment_service.dto.PaymentCallbackRequest;
import com.cinema.payment_service.entity.PaymentTransaction;
import com.cinema.payment_service.repository.PaymentTransactionRepository;
import com.cinema.payment_service.service.PaymentNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Locale;

@RestController
@RequestMapping("/payment-callbacks")
@RequiredArgsConstructor
public class PaymentCallbackController {

    private final PaymentTransactionRepository repository;
    private final PaymentNotificationService notificationService;

    @Value("${app.payment.callback-secret}")
    private String callbackSecret;

    @PostMapping("/{provider}")
    public PaymentTransaction receive(
            @PathVariable String provider,
            @RequestHeader(value = "X-Callback-Secret", required = false) String providedSecret,
            @RequestBody PaymentCallbackRequest body
    ) {
        if (providedSecret == null || !callbackSecret.equals(providedSecret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Callback không hợp lệ");
        }
        if (body.transactionReference() == null || body.transactionReference().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu mã tham chiếu giao dịch");
        }
        PaymentTransaction transaction = repository.findByTransactionReference(body.transactionReference())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch"));
        if (!transaction.getProvider().equalsIgnoreCase(provider)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nhà cung cấp thanh toán không khớp");
        }

        String status = body.status() == null ? "FAILED" : body.status().trim().toUpperCase(Locale.ROOT);
        transaction.setProviderTransactionId(body.providerTransactionId());
        transaction.setCallbackPayload(body.rawPayload());
        transaction.setStatus(status);
        if ("PAID".equals(status) || "SUCCESS".equals(status)) {
            transaction.setStatus("PAID");
            transaction.setPaidAt(LocalDateTime.now());
        }
        PaymentTransaction saved = repository.save(transaction);
        if ("PAID".equals(saved.getStatus())) {
            notificationService.paymentPaid(saved);
        } else if ("FAILED".equals(saved.getStatus())) {
            notificationService.paymentFailed(saved);
        }
        return saved;
    }
}
