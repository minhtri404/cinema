package com.example.user_service.controller;

import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private UserController userController;

    @Test
    void adminCanCreateCustomerWithEncodedPassword() {
        when(request.getAttribute("role")).thenReturn("ADMIN");
        when(userRepository.findByEmail("new.user@gmail.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("123456")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(10L);
            return user;
        });

        UserController.UserSummary result = userController.create(
                new UserController.UserRequest(
                        "Người dùng mới",
                        "NEW.USER@gmail.com",
                        "0909000000",
                        "CUSTOMER",
                        "123456"
                ),
                request
        );

        assertThat(result.id()).isEqualTo(10L);
        assertThat(result.email()).isEqualTo("new.user@gmail.com");
        assertThat(result.role()).isEqualTo("CUSTOMER");
    }

    @Test
    void staffCannotOpenUserAdministration() {
        when(request.getAttribute("role")).thenReturn("STAFF");

        assertThatThrownBy(() -> userController.getAll(request))
                .isInstanceOfSatisfying(ResponseStatusException.class, error ->
                        assertThat(error.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void adminCannotDeleteCurrentAccount() {
        when(request.getAttribute("role")).thenReturn("ADMIN");
        when(request.getAttribute("userId")).thenReturn(1L);

        assertThatThrownBy(() -> userController.delete(1L, request))
                .isInstanceOfSatisfying(ResponseStatusException.class, error ->
                        assertThat(error.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }
}
