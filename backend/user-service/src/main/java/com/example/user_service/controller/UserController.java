package com.example.user_service.controller;

import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User create(@RequestBody User request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new RuntimeException("Email da ton tai");
        });

        request.setId(null);
        request.setCreatedAt(LocalDateTime.now());
        if (request.getRole() == null || request.getRole().isBlank()) {
            request.setRole("STAFF");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            request.setPassword("demo_password_change_me");
        }

        return userRepository.save(request);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay nguoi dung"));

        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("Email da ton tai");
            }
        });

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(request.getPassword());
        }

        return userRepository.save(user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Khong tim thay nguoi dung");
        }
        userRepository.deleteById(id);
    }
}

