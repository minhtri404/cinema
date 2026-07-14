package com.cinema.notification_service.service;

import com.cinema.notification_service.entity.Notification;
import com.cinema.notification_service.messaging.NotificationRequestedEvent;
import com.cinema.notification_service.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class NotificationEventServiceTest {

    @Autowired
    private NotificationEventService eventService;

    @Autowired
    private NotificationRepository repository;

    @BeforeEach
    void clearNotifications() {
        repository.deleteAll();
    }

    @Test
    void createsOnlyOneInAppRecordAndDoesNotEmailWhenBookingIsCreated() {
        NotificationRequestedEvent event = new NotificationRequestedEvent(
                "BOOKING_CREATED:10",
                "BOOKING_CREATED",
                2L,
                "customer@example.com",
                "BOOKING",
                10L,
                "Đặt vé thành công",
                "Đơn vé #10 đã được tạo",
                LocalDateTime.now()
        );

        eventService.process(event);
        eventService.process(event);

        List<Notification> notifications = repository.findAll();
        assertThat(notifications).hasSize(1);
        assertThat(notifications.getFirst().getChannel()).isEqualTo("IN_APP");
        assertThat(notifications.getFirst().getStatus()).isEqualTo("SENT");
        assertThat(notifications.getFirst().getEmailStatus()).isNull();
        assertThat(notifications.getFirst().getEventKey()).isEqualTo("BOOKING_CREATED:10");
        assertThat(notifications).extracting(Notification::getAttemptCount)
                .containsOnly(1);
    }

    @Test
    void keepsPaidNotificationAndEmailDeliveryOnTheSameRecord() {
        NotificationRequestedEvent event = new NotificationRequestedEvent(
                "BOOKING_PAID:10",
                "BOOKING_PAID",
                2L,
                "customer@example.com",
                "BOOKING",
                10L,
                "Vé đã được thanh toán",
                "Đơn vé #10 đã thanh toán thành công",
                LocalDateTime.now()
        );

        eventService.process(event);

        List<Notification> notifications = repository.findAll();
        assertThat(notifications).hasSize(1);
        assertThat(notifications.getFirst().getChannel()).isEqualTo("IN_APP");
        assertThat(notifications.getFirst().getEmailRecipient()).isEqualTo("customer@example.com");
        assertThat(notifications.getFirst().getEmailStatus()).isEqualTo("SKIPPED");
        assertThat(notifications.getFirst().getEmailAttemptCount()).isEqualTo(1);
    }
}
