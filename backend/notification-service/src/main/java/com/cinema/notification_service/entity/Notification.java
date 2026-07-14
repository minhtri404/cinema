package com.cinema.notification_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notification_user", columnList = "user_id"),
                @Index(name = "idx_notification_status", columnList = "status"),
                @Index(name = "idx_notification_related", columnList = "related_type, related_id"),
                @Index(name = "idx_notification_event_type", columnList = "event_type")
        },
        uniqueConstraints = @UniqueConstraint(name = "uk_notification_event_key", columnNames = "event_key")
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 20)
    private String channel;

    @Column(nullable = false, length = 255)
    private String recipient;

    @Column(length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "related_type", length = 50)
    private String relatedType;

    @Column(name = "related_id")
    private Long relatedId;

    @Column(name = "event_key", length = 160)
    private String eventKey;

    @Column(name = "event_type", length = 60)
    private String eventType;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "email_recipient", length = 255)
    private String emailRecipient;

    @Column(name = "email_status", length = 20)
    private String emailStatus;

    @Column(name = "email_attempt_count")
    private Integer emailAttemptCount;

    @Column(name = "email_failure_reason", length = 500)
    private String emailFailureReason;

    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null || status.isBlank()) status = "PENDING";
        if (attemptCount == null) attemptCount = 0;
        if (emailAttemptCount == null) emailAttemptCount = 0;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
