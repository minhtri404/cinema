package com.cinema.notification_service.dto;

public record CreateNotificationRequest(
        Long userId,
        String channel,
        String recipient,
        String subject,
        String content,
        String relatedType,
        Long relatedId
) {}
