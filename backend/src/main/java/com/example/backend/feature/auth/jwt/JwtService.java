
package com.example.backend.feature.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    // Получаем секретный ключ и время жизни токена из application.yml
    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {

        // Преобразуем Base64-строку в криптографический ключ
        this.secretKey = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(secret)
        );

        this.expiration = expiration;
    }

    // Создаём JWT для пользователя
    public String generateToken(Long userId) {

        // Текущее время
        Date now = new Date();

        // Время окончания действия токена
        Date expiresAt = new Date(now.getTime() + expiration);

        return Jwts.builder()

                // Записываем ID пользователя в токен
                .subject(userId.toString())

                // Когда токен был создан
                .issuedAt(now)

                // Когда токен перестанет действовать
                .expiration(expiresAt)

                // Подписываем токен секретным ключом
                .signWith(secretKey)

                // Получаем готовую строку JWT
                .compact();
    }

    // Извлекаем ID пользователя из токена
    public Long getUserIdFromToken(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.parseLong(claims.getSubject());
    }

    // Проверяем подпись и срок действия токена
    public boolean isTokenValid(String token) {

        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Получить время окончания действия JWT
    public LocalDateTime getExpirationFromToken(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getExpiration()
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }

}

