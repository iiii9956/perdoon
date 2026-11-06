package com.example.backend.feature.auth.login;

public class LoginResponse {

    private Long userId;
    private String token;
    private String message;

    public LoginResponse(Long userId, String token, String message) {
        this.userId = userId;
        this.token = token;
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public String getToken() {
        return token;
    }

    public String getMessage() {
        return message;
    }
}