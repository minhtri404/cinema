package com.example.user_service.controller;

import com.example.user_service.dto.LoginRequest;
import com.example.user_service.dto.LoginResponse;
import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email khong ton tai"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Mat khau khong dung");
        }

        return new LoginResponse(
                "Dang nhap thanh cong",
                "demo-admin-token",
                user.getRole(),
                user.getFullName()
        );
    }

    @PostMapping("/create-admin")
    public User createAdmin() {
        if (userRepository.findByEmail("admin@gmail.com").isPresent()) {
            return userRepository.findByEmail("admin@gmail.com").get();
        }

        User admin = User.builder()
                .fullName("Admin Cinema")
                .email("admin@gmail.com")
                .password("123456")
                .phone("0900000000")
                .role("ADMIN")
                .createdAt(LocalDateTime.now())
                .build();

        return userRepository.save(admin);
    }
}
