package com.cinema.booking_service.config;

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
    TopicExchange notificationExchange(@Value("${app.messaging.notification-exchange}") String exchange) {
        return new TopicExchange(exchange, true, false);
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
