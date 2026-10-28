package com.example.backend.feature.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    }
}
