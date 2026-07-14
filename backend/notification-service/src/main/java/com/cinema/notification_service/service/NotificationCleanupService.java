package com.cinema.notification_service.service;

import com.cinema.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationCleanupService {

    private final NotificationRepository repository;

    @Value("${app.notification.retention-days:90}")
    private long retentionDays;

    @Scheduled(cron = "${app.notification.cleanup-cron:0 0 3 * * *}")
    @Transactional
    public long deleteExpiredNotifications() {
        long safeRetentionDays = Math.max(retentionDays, 1);
        return repository.deleteByCreatedAtBefore(LocalDateTime.now().minusDays(safeRetentionDays));
    }
}
