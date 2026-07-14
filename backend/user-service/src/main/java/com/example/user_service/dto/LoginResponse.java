package com.example.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
    private String message;
    private String token;
    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String role;
    private String fullName;
    private long expiresIn;
}
