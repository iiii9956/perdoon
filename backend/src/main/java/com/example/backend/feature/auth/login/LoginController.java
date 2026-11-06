
package com.example.backend.feature.auth.login;

import com.example.backend.feature.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final LoginService loginService;

    // Получаем LoginService через конструктор
    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    // POST /api/auth/login — вход пользователя
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        // Проверяем логин и пароль через сервис
        User user = loginService.login(request);

        // Формируем ответ
        LoginResponse response = new LoginResponse(
                user.getId(),
                null, // Пока JWT не реализовали
                "Авторизация успешна"
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}
