package com.cinema.payment_service.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignTokenConfig {

    @Bean
    RequestInterceptor authenticationForwarder() {
        return template -> {
            if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) return;
            HttpServletRequest request = attributes.getRequest();
            copy(template, request, HttpHeaders.AUTHORIZATION);
            copy(template, request, "X-User-Id");
            copy(template, request, "X-User-Role");
            copy(template, request, "X-User-Email");
        };
    }

    private void copy(RequestTemplate template, HttpServletRequest request, String name) {
        String value = request.getHeader(name);
        if (value != null && !value.isBlank()) template.header(name, value);
    }
}
