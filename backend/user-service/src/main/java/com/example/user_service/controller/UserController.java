package com.example.user_service.controller;

import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Set<String> ALLOWED_ROLES = Set.of("CUSTOMER", "USER", "STAFF", "ADMIN");

    @GetMapping
    public List<UserSummary> getAll(HttpServletRequest request) {
        requireAdmin(request);
        return userRepository.findAll().stream().map(UserSummary::from).toList();
    }

    @GetMapping("/customers")
    public List<UserSummary> getCustomers(HttpServletRequest request) {
        requireStaffOrAdmin(request);
        return userRepository.findAll().stream()
                .filter(user -> "CUSTOMER".equals(user.getRole()) || "USER".equals(user.getRole()))
                .map(UserSummary::from)
                .toList();
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id, HttpServletRequest request) {
        requireOwnerOrStaffOrAdmin(id, request);
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));
    }

    @PostMapping
    public UserSummary create(@RequestBody UserRequest data, HttpServletRequest request) {
        requireAdmin(request);
        validate(data, true);
        String email = normalizeEmail(data.email());
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng");
        }

        User user = User.builder()
                .fullName(data.fullName().trim())
                .email(email)
                .password(passwordEncoder.encode(data.password()))
                .phone(normalizePhone(data.phone()))
                .role(normalizeRole(data.role()))
                .createdAt(LocalDateTime.now())
                .build();
        return UserSummary.from(userRepository.save(user));
    }

    @PutMapping("/{id}")
    public UserSummary update(
            @PathVariable Long id,
            @RequestBody UserRequest data,
            HttpServletRequest request
    ) {
        requireAdmin(request);
        validate(data, false);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        String email = normalizeEmail(data.email());
        userRepository.findByEmail(email)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng");
                });

        String nextRole = normalizeRole(data.role());
        Long currentUserId = currentUserId(request);
        if (id.equals(currentUserId) && !"ADMIN".equals(nextRole)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể tự hạ quyền tài khoản đang đăng nhập");
        }
        if ("ADMIN".equals(user.getRole())
                && !"ADMIN".equals(nextRole)
                && userRepository.countByRoleIgnoreCase("ADMIN") <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hệ thống phải còn ít nhất một ADMIN");
        }

        user.setFullName(data.fullName().trim());
        user.setEmail(email);
        user.setPhone(normalizePhone(data.phone()));
        user.setRole(nextRole);
        if (data.password() != null && !data.password().isBlank()) {
            if (data.password().length() < 6) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có ít nhất 6 ký tự");
            }
            user.setPassword(passwordEncoder.encode(data.password()));
        }
        return UserSummary.from(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        if (id.equals(currentUserId(request))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể xóa tài khoản đang đăng nhập");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        if ("ADMIN".equals(user.getRole()) && userRepository.countByRoleIgnoreCase("ADMIN") <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hệ thống phải còn ít nhất một ADMIN");
        }
        userRepository.delete(user);
    }

    private void requireAdmin(HttpServletRequest request) {
        if (!"ADMIN".equals(request.getAttribute("role"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Can quyen ADMIN");
        }
    }

    private Long currentUserId(HttpServletRequest request) {
        Object value = request.getAttribute("userId");
        if (value instanceof Long id) return id;
        if (value instanceof Number number) return number.longValue();
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Thiếu thông tin người dùng đăng nhập");
    }

    private void validate(UserRequest data, boolean creating) {
        if (data == null || data.fullName() == null || data.fullName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Họ tên không được để trống");
        }
        if (data.email() == null || data.email().isBlank() || !data.email().contains("@")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không hợp lệ");
        }
        normalizeRole(data.role());
        if (creating && (data.password() == null || data.password().length() < 6)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có ít nhất 6 ký tự");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phone) {
        return phone == null || phone.isBlank() ? null : phone.trim();
    }

    private String normalizeRole(String role) {
        String value = role == null || role.isBlank()
                ? "CUSTOMER"
                : role.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_ROLES.contains(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vai trò không hợp lệ");
        }
        return value;
    }

    private void requireStaffOrAdmin(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"ADMIN".equals(role) && !"STAFF".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Can quyen STAFF hoac ADMIN");
        }
    }

    private void requireOwnerOrStaffOrAdmin(Long ownerId, HttpServletRequest request) {
        Object currentUserId = request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        if ("ADMIN".equals(role) || "STAFF".equals(role)) {
            return;
        }
        if (!(currentUserId instanceof Long userId) || !ownerId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chi chu tai khoan moi duoc xem thong tin nay");
        }
    }

    public record UserSummary(
            Long id,
            String fullName,
            String email,
            String phone,
            String role,
            LocalDateTime createdAt
    ) {
        static UserSummary from(User user) {
            return new UserSummary(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRole(),
                    user.getCreatedAt()
            );
        }
    }

    public record UserRequest(
            String fullName,
            String email,
            String phone,
            String role,
            String password
    ) {
    }
}
