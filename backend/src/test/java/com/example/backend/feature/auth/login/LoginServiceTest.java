package com.example.backend.feature.auth.login;

import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private LoginService loginService;

    @Test
    void rejectsBlankLogin() {
        assertThrows(
                IllegalArgumentException.class,
                () -> loginService.login(new LoginRequest("  ", "password1"))
        );
    }

    @Test
    void rejectsWrongPassword() {
        User user = new User("a@mail.com", null, "hash");
        when(userRepository.findByEmail("a@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password1", "hash")).thenReturn(false);

        assertThrows(
                IllegalArgumentException.class,
                () -> loginService.login(new LoginRequest("a@mail.com", "password1"))
        );
    }

    @Test
    void returnsUserWhenPasswordMatches() {
        User user = new User("a@mail.com", null, "hash");
        when(userRepository.findByEmail("a@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password1", "hash")).thenReturn(true);

        User result = loginService.login(new LoginRequest(" A@mail.com ", "password1"));

        assertSame(user, result);
    }
}
