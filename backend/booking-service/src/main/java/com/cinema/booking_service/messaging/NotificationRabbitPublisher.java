package com.cinema.booking_service.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class NotificationRabbitPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${app.messaging.notification-exchange}")
    private String exchange;

    @Value("${app.messaging.notification-routing-key}")
    private String routingKey;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void publish(NotificationRequestedEvent event) {
        rabbitTemplate.convertAndSend(exchange, routingKey, event);
    }
}
