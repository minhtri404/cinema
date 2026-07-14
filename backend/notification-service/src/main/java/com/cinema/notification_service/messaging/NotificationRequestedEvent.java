package com.cinema.notification_service.messaging;

import java.time.LocalDateTime;

public record NotificationRequestedEvent(
        String eventKey,
        String eventType,
        Long userId,
        String recipient,
        String relatedType,
        Long relatedId,
        String subject,
        String content,
        LocalDateTime occurredAt
) {
}
