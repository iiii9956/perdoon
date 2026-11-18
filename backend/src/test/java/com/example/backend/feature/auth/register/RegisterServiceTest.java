package com.example.backend.feature.auth.register;

import com.example.backend.exception.EmailAlreadyExistsException;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegisterServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private RegisterService registerService;

    @Test
    void rejectsDuplicateEmail() {
        when(userRepository.existsByEmail("a@mail.com")).thenReturn(true);

        assertThrows(
                EmailAlreadyExistsException.class,
                () -> registerService.register(new RegisterRequest(" A@mail.com ", null, "password1"))
        );
    }

    @Test
    void rejectsShortPassword() {
        assertThrows(
                IllegalArgumentException.class,
                () -> registerService.register(new RegisterRequest("a@mail.com", null, "1234567"))
        );
    }

    @Test
    void savesUserWithHashedPassword() {
        when(userRepository.existsByEmail("a@mail.com")).thenReturn(false);
        when(passwordEncoder.encode("password1")).thenReturn("hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = registerService.register(new RegisterRequest(" A@mail.com ", "   ", "password1"));

        assertEquals("a@mail.com", user.getEmail());
        assertEquals(null, user.getPhone());
        assertEquals("hash", user.getPasswordHash());
        verify(userRepository).save(user);
    }
}
