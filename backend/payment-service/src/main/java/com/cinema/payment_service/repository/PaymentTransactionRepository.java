package com.cinema.payment_service.repository;

import com.cinema.payment_service.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PaymentTransaction> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
    Optional<PaymentTransaction> findByTransactionReference(String transactionReference);
}
