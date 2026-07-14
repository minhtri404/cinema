package com.cinema.payment_service.controller;

import com.cinema.payment_service.dto.CreatePaymentRequest;
import com.cinema.payment_service.dto.PaymentCallbackRequest;
import com.cinema.payment_service.dto.RefundPaymentRequest;
import com.cinema.payment_service.entity.PaymentTransaction;
import com.cinema.payment_service.repository.PaymentTransactionRepository;
import com.cinema.payment_service.security.AuthenticatedUser;
import com.cinema.payment_service.service.PaymentNotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PaymentController {

    private final PaymentTransactionRepository repository;
    private final PaymentNotificationService notificationService;

    @GetMapping
    public List<PaymentTransaction> getAll(HttpServletRequest request) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        return user.isAdminOrStaff()
                ? repository.findAll()
                : repository.findByUserIdOrderByCreatedAtDesc(user.id());
    }

    @GetMapping("/{id}")
    public PaymentTransaction getById(@PathVariable Long id, HttpServletRequest request) {
        PaymentTransaction transaction = find(id);
        requireOwnerOrStaff(transaction, AuthenticatedUser.from(request));
        return transaction;
    }

    @GetMapping("/booking/{bookingId}")
    public List<PaymentTransaction> getByBooking(
            @PathVariable Long bookingId,
            HttpServletRequest request
    ) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        List<PaymentTransaction> transactions = repository.findByBookingIdOrderByCreatedAtDesc(bookingId);
        if (!user.isAdminOrStaff() && transactions.stream().anyMatch(item -> !user.owns(item.getUserId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem giao dịch này");
        }
        return transactions;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentTransaction create(
            @RequestBody CreatePaymentRequest body,
            HttpServletRequest request
    ) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        if (body.bookingId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn đặt vé không được để trống");
        }
        if (body.amount() == null || body.amount().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền phải lớn hơn 0");
        }

        Long ownerId = user.isAdminOrStaff() && body.userId() != null ? body.userId() : user.id();
        String provider = normalize(body.provider(), "MANUAL");

        PaymentTransaction transaction = PaymentTransaction.builder()
                .bookingId(body.bookingId())
                .userId(ownerId)
                .recipient(notificationService.resolveRecipient(ownerId, user))
                .transactionReference("PAY-" + UUID.randomUUID().toString().replace("-", "").toUpperCase(Locale.ROOT))
                .provider(provider)
                .paymentMethod(normalize(body.paymentMethod(), provider))
                .amount(body.amount())
                .refundedAmount(BigDecimal.ZERO)
                .currency("VND")
                .status("PENDING")
                .description(body.description())
                .build();
        return repository.save(transaction);
    }

    @PostMapping("/{id}/complete")
    public PaymentTransaction complete(@PathVariable Long id, HttpServletRequest request) {
        requireStaff(AuthenticatedUser.from(request));
        PaymentTransaction transaction = find(id);
        if ("REFUNDED".equals(transaction.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Giao dịch đã hoàn tiền");
        }
        transaction.setStatus("PAID");
        transaction.setPaidAt(LocalDateTime.now());
        PaymentTransaction saved = repository.save(transaction);
        notificationService.paymentPaid(saved);
        return saved;
    }

    @PostMapping("/{id}/refund")
    @Transactional
    public PaymentTransaction refund(
            @PathVariable Long id,
            @RequestBody RefundPaymentRequest body,
            HttpServletRequest request
    ) {
        requireStaff(AuthenticatedUser.from(request));
        PaymentTransaction transaction = find(id);
        if (!"PAID".equals(transaction.getStatus()) && !"PARTIALLY_REFUNDED".equals(transaction.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ giao dịch đã thanh toán mới được hoàn tiền");
        }
        BigDecimal refund = body.amount() == null ? transaction.getAmount() : body.amount();
        if (refund.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền hoàn phải lớn hơn 0");
        }
        BigDecimal refunded = transaction.getRefundedAmount().add(refund);
        if (refunded.compareTo(transaction.getAmount()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền hoàn vượt quá số tiền đã thanh toán");
        }
        transaction.setRefundedAmount(refunded);
        transaction.setRefundedAt(LocalDateTime.now());
        transaction.setStatus(refunded.compareTo(transaction.getAmount()) == 0 ? "REFUNDED" : "PARTIALLY_REFUNDED");
        PaymentTransaction saved = repository.save(transaction);
        notificationService.paymentRefunded(saved);
        return saved;
    }

    private PaymentTransaction find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch"));
    }

    private void requireOwnerOrStaff(PaymentTransaction transaction, AuthenticatedUser user) {
        if (!user.isAdminOrStaff() && !user.owns(transaction.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem giao dịch này");
        }
    }

    private void requireStaff(AuthenticatedUser user) {
        if (!user.isAdminOrStaff()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cần quyền nhân viên hoặc quản trị viên");
        }
    }

    private String normalize(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim().toUpperCase(Locale.ROOT);
    }
}
