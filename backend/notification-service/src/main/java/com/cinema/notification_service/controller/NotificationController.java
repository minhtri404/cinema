package com.cinema.notification_service.controller;

import com.cinema.notification_service.dto.CreateNotificationRequest;
import com.cinema.notification_service.dto.FailNotificationRequest;
import com.cinema.notification_service.entity.Notification;
import com.cinema.notification_service.repository.NotificationRepository;
import com.cinema.notification_service.security.AuthenticatedUser;
import com.cinema.notification_service.service.NotificationDeliveryService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin("*")
public class NotificationController {

    private final NotificationRepository repository;
    private final NotificationDeliveryService deliveryService;

    @GetMapping
    public List<Notification> getAll(HttpServletRequest request) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        return user.isAdminOrStaff()
                ? repository.findAllByOrderByCreatedAtDesc()
                : repository.findByUserIdAndChannelOrderByCreatedAtDesc(user.id(), "IN_APP");
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(HttpServletRequest request) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        return Map.of("count", repository.countByUserIdAndChannelAndReadAtIsNull(user.id(), "IN_APP"));
    }

    @GetMapping("/{id}")
    public Notification getById(@PathVariable Long id, HttpServletRequest request) {
        Notification notification = find(id);
        requireOwnerOrStaff(notification, AuthenticatedUser.from(request));
        return notification;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Notification create(
            @RequestBody CreateNotificationRequest body,
            HttpServletRequest request
    ) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        requireStaff(user);
        if (body.content() == null || body.content().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung thông báo không được để trống");
        }
        String channel = normalize(body.channel(), "IN_APP");
        if (!Set.of("IN_APP", "EMAIL").contains(channel)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ hỗ trợ thông báo trong ứng dụng hoặc email");
        }
        Long ownerId = user.isAdminOrStaff() && body.userId() != null ? body.userId() : user.id();
        String recipient = body.recipient();
        if ((recipient == null || recipient.isBlank()) && "EMAIL".equals(channel)) recipient = user.email();
        if (recipient == null || recipient.isBlank()) recipient = String.valueOf(ownerId);
        if ("EMAIL".equals(channel) && !recipient.contains("@")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Địa chỉ email người nhận không hợp lệ");
        }

        Notification notification = Notification.builder()
                .userId(ownerId)
                .channel(channel)
                .recipient(recipient)
                .subject(body.subject())
                .content(body.content())
                .status("PENDING")
                .relatedType(normalizeNullable(body.relatedType()))
                .relatedId(body.relatedId())
                .build();
        return deliveryService.deliver(repository.save(notification));
    }

    @PutMapping("/{id}/read")
    public Notification markRead(@PathVariable Long id, HttpServletRequest request) {
        Notification notification = find(id);
        requireOwnerOrStaff(notification, AuthenticatedUser.from(request));
        notification.setReadAt(LocalDateTime.now());
        return repository.save(notification);
    }

    @PutMapping("/read-all")
    public Map<String, Integer> markAllRead(HttpServletRequest request) {
        AuthenticatedUser user = AuthenticatedUser.from(request);
        List<Notification> unread = repository.findByUserIdAndChannelAndReadAtIsNull(user.id(), "IN_APP");
        LocalDateTime now = LocalDateTime.now();
        unread.forEach(notification -> notification.setReadAt(now));
        repository.saveAll(unread);
        return Map.of("updated", unread.size());
    }

    @PostMapping("/{id}/retry")
    public Notification retry(@PathVariable Long id, HttpServletRequest request) {
        requireStaff(AuthenticatedUser.from(request));
        Notification notification = find(id);
        if ("SENT".equals(notification.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Thông báo đã được gửi thành công");
        }
        notification.setStatus("PENDING");
        return deliveryService.deliver(notification);
    }

    @PutMapping("/{id}/sent")
    public Notification markSent(@PathVariable Long id, HttpServletRequest request) {
        requireStaff(AuthenticatedUser.from(request));
        Notification notification = find(id);
        notification.setStatus("SENT");
        notification.setSentAt(LocalDateTime.now());
        notification.setFailureReason(null);
        return repository.save(notification);
    }

    @PutMapping("/{id}/failed")
    public Notification markFailed(
            @PathVariable Long id,
            @RequestBody FailNotificationRequest body,
            HttpServletRequest request
    ) {
        requireStaff(AuthenticatedUser.from(request));
        Notification notification = find(id);
        notification.setStatus("FAILED");
        notification.setFailureReason(body.reason());
        return repository.save(notification);
    }

    private Notification find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
    }

    private void requireOwnerOrStaff(Notification notification, AuthenticatedUser user) {
        if (!user.isAdminOrStaff() && !user.owns(notification.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem thông báo này");
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

    private String normalizeNullable(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase(Locale.ROOT);
    }
}
