package com.example.backend.feature.auth.jwt;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService(
            "dGhpcy1pcy1hLWRldi1zZWNyZXQta2V5LWNoYW5nZS1tZSEh",
            60_000
    );

    @Test
    void createsTokenWithUserId() {
        String token = jwtService.generateToken(42L);

        assertEquals(42L, jwtService.getUserIdFromToken(token));
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void rejectsTamperedToken() {
        String token = jwtService.generateToken(42L);

        assertFalse(jwtService.isTokenValid(token + "x"));
    }
}
