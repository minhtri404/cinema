package com.cinema.notification_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitNotificationConfig {

    @Bean
    TopicExchange notificationExchange(
            @Value("${app.messaging.notification-exchange}") String exchange
    ) {
        return new TopicExchange(exchange, true, false);
    }

    @Bean
    Queue notificationQueue(@Value("${app.messaging.notification-queue}") String queue) {
        return QueueBuilder.durable(queue)
                .deadLetterExchange("")
                .deadLetterRoutingKey(queue + ".dead")
                .build();
    }

    @Bean
    Queue notificationDeadLetterQueue(@Value("${app.messaging.notification-queue}") String queue) {
        return QueueBuilder.durable(queue + ".dead").build();
    }

    @Bean
    Binding notificationBinding(
            Queue notificationQueue,
            TopicExchange notificationExchange,
            @Value("${app.messaging.notification-routing-key}") String routingKey
    ) {
        return BindingBuilder.bind(notificationQueue).to(notificationExchange).with(routingKey);
    }

    @Bean
    Jackson2JsonMessageConverter notificationJsonConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    RabbitTemplate notificationRabbitTemplate(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter notificationJsonConverter
    ) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(notificationJsonConverter);
        return template;
    }
}
