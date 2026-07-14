package com.example.user_service.controller;

import com.example.user_service.dto.LoginRequest;
import com.example.user_service.dto.LoginResponse;
import com.example.user_service.dto.LogoutRequest;
import com.example.user_service.dto.RefreshTokenRequest;
import com.example.user_service.dto.RegisterRequest;
import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public LoginResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@RequestBody RefreshTokenRequest request) {
        return authService.refresh(request.getRefreshToken());
    }

    @PostMapping("/logout")
    public String logout(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestBody(required = false) LogoutRequest request
    ) {
        String accessToken = extractBearerToken(authorization);
        String refreshToken = request == null ? null : request.getRefreshToken();
        authService.logout(accessToken, refreshToken);
        return "Dang xuat thanh cong";
    }

    @PostMapping("/create-admin")
    public User createAdmin() {
        if (userRepository.findByEmail("admin@gmail.com").isPresent()) {
            return userRepository.findByEmail("admin@gmail.com").get();
        }

        User admin = User.builder()
                .fullName("Admin Cinema")
                .email("admin@gmail.com")
                .password(passwordEncoder.encode("123456"))
                .phone("0900000000")
                .role("ADMIN")
                .createdAt(LocalDateTime.now())
                .build();

        return userRepository.save(admin);
    }

    private String extractBearerToken(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
}
