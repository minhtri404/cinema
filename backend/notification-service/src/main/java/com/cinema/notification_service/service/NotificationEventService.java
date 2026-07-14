package com.cinema.notification_service.service;

import com.cinema.notification_service.entity.Notification;
import com.cinema.notification_service.messaging.NotificationRequestedEvent;
import com.cinema.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationEventService {

    private static final Set<String> EMAIL_EVENT_TYPES = Set.of(
            "BOOKING_PAID",
            "PAYMENT_PAID",
            "BOOKING_CANCELLED"
    );

    private final NotificationRepository repository;
    private final NotificationDeliveryService deliveryService;

    @Transactional
    public void process(NotificationRequestedEvent event) {
        validate(event);
        createNotification(event);
    }

    private void createNotification(NotificationRequestedEvent event) {
        String eventKey = event.eventKey().trim();
        if (repository.existsByEventKey(eventKey)) return;

        String eventType = normalize(event.eventType());
        boolean emailRequired = EMAIL_EVENT_TYPES.contains(eventType);
        String emailRecipient = validEmail(event.recipient()) ? event.recipient().trim() : null;

        Notification notification = Notification.builder()
                .userId(event.userId())
                .channel("IN_APP")
                .recipient(String.valueOf(event.userId()))
                .subject(event.subject())
                .content(event.content())
                .status("PENDING")
                .relatedType(normalize(event.relatedType()))
                .relatedId(event.relatedId())
                .eventKey(eventKey)
                .eventType(eventType)
                .attemptCount(0)
                .emailAttemptCount(0)
                .build();
        deliveryService.deliverEvent(repository.save(notification), emailRecipient, emailRequired);
    }

    private void validate(NotificationRequestedEvent event) {
        if (event == null || event.eventKey() == null || event.eventKey().isBlank()) {
            throw new IllegalArgumentException("Sự kiện thông báo thiếu khóa chống trùng");
        }
        if (event.userId() == null) throw new IllegalArgumentException("Sự kiện thông báo thiếu người dùng");
        if (event.content() == null || event.content().isBlank()) {
            throw new IllegalArgumentException("Sự kiện thông báo thiếu nội dung");
        }
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase(Locale.ROOT);
    }

    private boolean validEmail(String value) {
        return value != null && value.contains("@") && !value.isBlank();
    }
}
