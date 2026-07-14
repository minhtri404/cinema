package com.cinema.payment_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserSummary getById(@PathVariable("id") Long id);

    record UserSummary(Long id, String fullName, String email, String role) {
    }
}
