package com.example.backend.feature.user;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Получить количество пользователей
    @GetMapping("/count")
    public long getUsersCount() {
        return userService.countUsers();
    }@GetMapping("/me")
    public UserResponse getCurrentUser(
            @AuthenticationPrincipal String userId
    ) {

        // Проверяем, что ID пользователя присутствует
        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Необходима авторизация"
            );
        }

        // Ищем пользователя по ID из JWT
        User user = userService.findById(Long.parseLong(userId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        // Преобразуем User в безопасный DTO
        return new UserResponse(user);
    }
}
