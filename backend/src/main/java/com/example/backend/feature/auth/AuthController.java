package com.example.backend.feature.auth;

import com.example.backend.feature.user.User;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    // Внедряем AuthService
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Регистрация пользователя
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(

            @RequestBody RegisterRequest request

    ) {
        System.out.println("Полученная почта: " + request.getEmail());
        System.out.println("Полученный телефон: " + request.getPhone());
        System.out.println("Полученный пароль: " + request.getPassword());
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

