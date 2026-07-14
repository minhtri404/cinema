package com.cinema.notification_service.messaging;

import com.cinema.notification_service.service.NotificationEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventConsumer {

    private final NotificationEventService eventService;

    @RabbitListener(queues = "${app.messaging.notification-queue}")
    public void consume(NotificationRequestedEvent event) {
        eventService.process(event);
    }
}
