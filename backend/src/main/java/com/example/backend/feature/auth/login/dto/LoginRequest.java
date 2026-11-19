package com.example.backend.feature.auth.login.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Введите email или телефон")
    private String login;
    @NotBlank(message = "Введите пароль")
    private String password;

    // Пустой конструктор для Spring
    public LoginRequest() {
    }

    // Конструктор с параметрами
    public LoginRequest(String login, String password) {
        this.login = login;
        this.password = password;
    }

    // Получаем логин
    public String getLogin() {
        return login;
    }

    // Устанавливаем логин
    public void setLogin(String login) {
        this.login = login;
    }

    // Получаем пароль
    public String getPassword() {
        return password;
    }

    // Устанавливаем пароль
    public void setPassword(String password) {
        this.password = password;
    }
}
