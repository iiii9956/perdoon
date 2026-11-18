
package com.example.backend.feature.auth.logout;

import com.example.backend.feature.auth.jwt.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class RevokedTokenService {

    private final RevokedTokenRepository revokedTokenRepository;
    private final JwtService jwtService;

    public RevokedTokenService(
            RevokedTokenRepository revokedTokenRepository,
            JwtService jwtService
    ) {
        this.revokedTokenRepository = revokedTokenRepository;
        this.jwtService = jwtService;
    }

    // Отозвать токен
    @Transactional
    public void revokeToken(String token) {

        if (!jwtService.isTokenValid(token)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Недействительный токен"
            );
        }

        String tokenHash = hashToken(token);

        if (revokedTokenRepository.existsByTokenHash(tokenHash)) {
            return;
        }

        RevokedToken revokedToken = new RevokedToken(
                tokenHash,
                jwtService.getExpirationFromToken(token)
        );

        revokedTokenRepository.save(revokedToken);
    }

    // Проверить, был ли токен отозван
    public boolean isTokenRevoked(String token) {
        return revokedTokenRepository.existsByTokenHash(
                hashToken(token)
        );
    }

    // Создать SHA-256 хеш токена
    private String hashToken(String token) {

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return java.util.HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                    "Не удалось создать хеш токена",
                    e
            );
        }
    }
}
