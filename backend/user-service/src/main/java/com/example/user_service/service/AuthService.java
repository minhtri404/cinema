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
import java.util.Locale;
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
    private final EmailVerificationService emailVerificationService;

    @Value("${app.jwt.refresh-token-ttl-seconds:604800}")
    private long refreshTokenTtlSeconds;

    public LoginResponse register(RegisterRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thong tin dang ky khong hop le");
        }

        String fullName = normalizeRequired(request.getFullName(), "Ho ten khong duoc de trong");
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();
        String phone = request.getPhone() == null || request.getPhone().isBlank()
                ? null
                : request.getPhone().trim();

        if (password == null || password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mat khau phai co it nhat 6 ky tu");
        }

        userRepository.findByEmail(email).ifPresent(user -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email da ton tai");
        });

        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .phone(phone)
                .role("CUSTOMER")
                .emailVerified(false)
                .emailVerificationToken(UUID.randomUUID().toString())
                .emailVerificationTokenExpiresAt(LocalDateTime.now().plusHours(24))
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        emailVerificationService.sendActivationEmail(savedUser);

        return new LoginResponse(
                "Dang ky thanh cong. Vui long kiem tra email de kich hoat tai khoan.",
                null,
                null,
                null,
                savedUser.getId(),
                savedUser.getRole(),
                savedUser.getFullName(),
                0,
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getEmailVerified()
        );
    }

    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email khong ton tai"));

        if (!passwordMatches(request.getPassword(), user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mat khau khong dung");
        }

        if (requiresEmailVerification(user) && Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tai khoan chua kich hoat. Vui long kiem tra email.");
        }

        return issueTokens(user, "Dang nhap thanh cong");
    }

    public LoginResponse verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token kich hoat khong hop le");
        }

        User user = userRepository.findByEmailVerificationToken(token.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token kich hoat khong hop le"));

        if (user.getEmailVerificationTokenExpiresAt() != null
                && user.getEmailVerificationTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token kich hoat da het han");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiresAt(null);

        return issueTokens(userRepository.save(user), "Kich hoat tai khoan thanh cong");
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
                jwtService.getAccessTokenTtlSeconds(),
                user.getEmail(),
                user.getPhone(),
                user.getEmailVerified()
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

    private boolean requiresEmailVerification(User user) {
        return "CUSTOMER".equalsIgnoreCase(user.getRole()) || "USER".equalsIgnoreCase(user.getRole());
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String normalizeEmail(String email) {
        String value = normalizeRequired(email, "Email khong duoc de trong").toLowerCase(Locale.ROOT);
        if (!value.contains("@")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email khong hop le");
        }
        return value;
    }
}
