package com.example.backend.feature.auth.register;

import com.example.backend.feature.auth.register.dto.RegisterResponse;
import com.example.backend.feature.user.User;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class RegisterController {

    private final RegisterService authService;

    // Внедряем AuthService
    public RegisterController(RegisterService authService) {
        this.authService = authService;
    }

    // Регистрация пользователя
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(

            @RequestBody RegisterRequest request

    ) {
        User user = authService.register(request);

        RegisterResponse response = new RegisterResponse(
                user.getId(),
                "Регистрация успешна"
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}

