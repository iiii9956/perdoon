
package com.example.backend.feature.auth.logout;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class LogoutController {

    private final RevokedTokenService revokedTokenService;

    public LogoutController(RevokedTokenService revokedTokenService) {
        this.revokedTokenService = revokedTokenService;
    }

    // Выход из аккаунта
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @RequestHeader("Authorization") String authorizationHeader
    ) {

        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Необходим JWT-токен"
            );
        }

        String token = authorizationHeader.substring(7);

        revokedTokenService.revokeToken(token);

        return ResponseEntity.ok("Вы успешно вышли из аккаунта");
    }
}
