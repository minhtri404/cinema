package com.example.user_service.service;

import com.example.user_service.dto.LoginRequest;
import com.example.user_service.dto.LoginResponse;
import com.example.user_service.dto.RegisterRequest;
import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String REFRESH_PREFIX = "auth:refresh:";
    private static final String BLACKLIST_PREFIX = "auth:blacklist:";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StringRedisTemplate redisTemplate;

    @Value("${app.jwt.refresh-token-ttl-seconds:604800}")
    private long refreshTokenTtlSeconds;

    public LoginResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email da ton tai");
        });

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role("USER")
                .createdAt(LocalDateTime.now())
                .build();

        return issueTokens(userRepository.save(user), "Dang ky thanh cong");
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email khong ton tai"));

        if (!passwordMatches(request.getPassword(), user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mat khau khong dung");
        }

        return issueTokens(user, "Dang nhap thanh cong");
    }

    public LoginResponse refresh(String refreshToken) {
        String userIdValue = redisTemplate.opsForValue().get(refreshKey(refreshToken));
        if (userIdValue == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token khong hop le hoac da het han");
        }

        redisTemplate.delete(refreshKey(refreshToken));
        User user = userRepository.findById(Long.valueOf(userIdValue))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nguoi dung khong ton tai"));

        return issueTokens(user, "Cap lai access token thanh cong");
    }

    public void logout(String accessToken, String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            redisTemplate.delete(refreshKey(refreshToken));
        }

        if (accessToken != null && !accessToken.isBlank()) {
            Claims claims = jwtService.parseClaims(accessToken);
            String jwtId = claims.getId();
            if (jwtId != null) {
                long secondsToExpire = Math.max(1, claims.getExpiration().toInstant().getEpochSecond() - Instant.now().getEpochSecond());
                redisTemplate.opsForValue().set(BLACKLIST_PREFIX + jwtId, "logout", Duration.ofSeconds(secondsToExpire));
            }
        }
    }

    private LoginResponse issueTokens(User user, String message) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(refreshKey(refreshToken), user.getId().toString(), Duration.ofSeconds(refreshTokenTtlSeconds));

        return new LoginResponse(
                message,
                accessToken,
                accessToken,
                refreshToken,
                user.getId(),
                user.getRole(),
                user.getFullName(),
                jwtService.getAccessTokenTtlSeconds()
        );
    }

    private boolean passwordMatches(String rawPassword, User user) {
        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            return true;
        }

        if (rawPassword.equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }

        return false;
    }

    private String refreshKey(String refreshToken) {
        return REFRESH_PREFIX + refreshToken;
    }
}
