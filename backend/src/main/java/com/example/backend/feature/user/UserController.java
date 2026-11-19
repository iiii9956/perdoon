
package com.example.backend.feature.user;

import com.example.backend.feature.user.dto.UserResponse;
import com.example.backend.feature.user.dto.PublicUserResponse;
import com.example.backend.feature.user.dto.UpdateProfileRequest;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
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
    }

    // Получить собственный профиль
    @GetMapping("/me")
    public UserResponse getCurrentUser(
            @AuthenticationPrincipal String userId
    ) {
        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Необходима авторизация"
            );
        }

        User user = userService.findById(Long.parseLong(userId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        return new UserResponse(user);
    }

    // Изменить собственный профиль
    @PutMapping("/me")
    public UserResponse updateProfile(
            @AuthenticationPrincipal String userId,
         @Valid @RequestBody UpdateProfileRequest request
    ) {
        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Необходима авторизация"
            );
        }

        User updatedUser = userService.updateProfile(
                Long.parseLong(userId),
                request
        );

        return new UserResponse(updatedUser);
    }

    // Посмотреть чужой профиль
    @GetMapping("/{id}")
    public PublicUserResponse getUserProfile(@PathVariable Long id) {

        User user = userService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        return new PublicUserResponse(user);
    }


    // Удалить собственный аккаунт
    @DeleteMapping("/me")
    public ResponseEntity<String> deleteCurrentUser(
            @AuthenticationPrincipal String userId
    ) {
        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Необходима авторизация"
            );
        }

        Long id = Long.parseLong(userId);

        if (userService.findById(id).isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Пользователь не найден"
            );
        }

        userService.deleteById(id);

        return ResponseEntity.ok("Аккаунт успешно удалён");
    }

}
