
package com.example.backend.feature.auth.register.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Введите имя пользователя")
    @Size(max = 30, message = "Имя слишком длинное")
    private String username;
    @Email(message = "Некорректный формат электронной почты")
    @Size(max = 254, message = "Почта не должна превышать 254 символа")
    private String email;
    @Pattern(
            regexp = "^\\+?[0-9]{10,15}$",
            message = "Телефон должен содержать от 10 до 15 цифр и может начинаться с +"
    )
    private String phone;
    @NotBlank(message = "Введите пароль")
    @Size(min = 8, max = 100, message = "Пароль должен содержать от 8 до 100 символов")
    private String password;

    public RegisterRequest(String email, String phone, String password, String username) {
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
