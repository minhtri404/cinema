package com.cinema.booking_service.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductServiceClient {

    private final RestTemplate restTemplate;

    @Value("${product-service.base-url:http://movie-service}")
    private String productServiceBaseUrl;

    @CircuitBreaker(name = "productService", fallbackMethod = "productFallback")
    public Map<String, Object> getProductById(Long productId) {
        return restTemplate.exchange(
                productServiceBaseUrl + "/api/movies/" + productId,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {
                }
        ).getBody();
    }

    @SuppressWarnings("unused")
    private Map<String, Object> productFallback(Long productId, Throwable throwable) {
        Map<String, Object> fallback = new LinkedHashMap<>();
        fallback.put("id", productId);
        fallback.put("available", false);
        fallback.put("fallback", true);
        fallback.put("message", "Product/Movie Service is unavailable. Booking Service fallback response was returned.");
        fallback.put("error", throwable.getClass().getSimpleName());
        return fallback;
    }
}
