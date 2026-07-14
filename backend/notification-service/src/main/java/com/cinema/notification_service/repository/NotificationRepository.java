package com.cinema.notification_service.repository;

import com.cinema.notification_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByUserIdAndChannelOrderByCreatedAtDesc(Long userId, String channel);
    List<Notification> findByUserIdAndChannelAndReadAtIsNull(Long userId, String channel);
    long countByUserIdAndChannelAndReadAtIsNull(Long userId, String channel);
    boolean existsByEventKey(String eventKey);
    Optional<Notification> findByEventKey(String eventKey);
    long deleteByCreatedAtBefore(LocalDateTime cutoff);
}
