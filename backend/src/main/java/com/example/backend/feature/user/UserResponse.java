
package com.example.backend.feature.user;

import java.time.LocalDateTime;

// DTO с безопасными данными пользователя
public class UserResponse {

    private Long id;
    private String email;
    private String phone;
    private LocalDateTime createdAt;

    // Конструктор для преобразования User в UserResponse
    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.createdAt = user.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
