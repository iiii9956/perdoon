

package com.example.backend.feature.auth.login;

import com.example.backend.feature.auth.login.dto.LoginRequest;
import com.example.backend.feature.auth.login.dto.LoginResponse;
import com.example.backend.feature.user.User;
import com.example.backend.feature.auth.jwt.JwtService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final LoginService loginService;
    private final JwtService jwtService;

    // Spring автоматически передаст необходимые сервисы через конструктор
    public LoginController(LoginService loginService, JwtService jwtService) {
        this.loginService = loginService;
        this.jwtService = jwtService;
    }

    // Авторизация пользователя
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {

        // Проверяем логин и пароль
        User user = loginService.login(request);

        // Создаём JWT-токен для пользователя
        String token = jwtService.generateToken(user.getId());

        // Формируем ответ
        LoginResponse response = new LoginResponse(
                user.getId(),
                token,
                "Авторизация успешна"
        );

        return ResponseEntity.ok(response);
    }
}
