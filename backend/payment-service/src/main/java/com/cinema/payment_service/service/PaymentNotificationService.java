package com.cinema.payment_service.service;

import com.cinema.payment_service.client.UserClient;
import com.cinema.payment_service.entity.PaymentTransaction;
import com.cinema.payment_service.messaging.NotificationRequestedEvent;
import com.cinema.payment_service.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentNotificationService {

    private final UserClient userClient;
    private final ApplicationEventPublisher publisher;

    public String resolveRecipient(Long userId, AuthenticatedUser actor) {
        if (actor.owns(userId) && actor.email() != null && !actor.email().isBlank()) return actor.email();
        try {
            return userClient.getById(userId).email();
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    public void paymentPaid(PaymentTransaction transaction) {
        publish(
                transaction,
                "PAYMENT_PAID:" + transaction.getId(),
                "PAYMENT_PAID",
                "Thanh toán thành công",
                "Giao dịch " + transaction.getTransactionReference() + " cho đơn vé #"
                        + transaction.getBookingId() + " đã thanh toán " + money(transaction.getAmount()) + "."
        );
    }

    public void paymentFailed(PaymentTransaction transaction) {
        publish(
                transaction,
                "PAYMENT_FAILED:" + transaction.getId(),
                "PAYMENT_FAILED",
                "Thanh toán không thành công",
                "Giao dịch " + transaction.getTransactionReference() + " cho đơn vé #"
                        + transaction.getBookingId() + " chưa thành công. Vui lòng thử lại."
        );
    }

    public void paymentRefunded(PaymentTransaction transaction) {
        String refunded = transaction.getRefundedAmount() == null
                ? "0"
                : transaction.getRefundedAmount().stripTrailingZeros().toPlainString();
        publish(
                transaction,
                "PAYMENT_REFUNDED:" + transaction.getId() + ":" + refunded,
                "PAYMENT_REFUNDED",
                "Giao dịch đã được hoàn tiền",
                "Giao dịch " + transaction.getTransactionReference() + " đã hoàn "
                        + money(transaction.getRefundedAmount()) + ". Trạng thái: " + transaction.getStatus() + "."
        );
    }

    private void publish(
            PaymentTransaction transaction,
            String eventKey,
            String eventType,
            String subject,
            String content
    ) {
        publisher.publishEvent(new NotificationRequestedEvent(
                eventKey,
                eventType,
                transaction.getUserId(),
                transaction.getRecipient(),
                "PAYMENT",
                transaction.getId(),
                subject,
                content,
                LocalDateTime.now()
        ));
    }

    private String money(BigDecimal value) {
        if (value == null) return "0đ";
        return String.format("%,.0fđ", value).replace(',', '.');
    }
}
