
package com.example.backend.feature.admin;

import com.example.backend.feature.role.Role;
import com.example.backend.feature.user.User;

import java.time.LocalDateTime;

public class AdminUserResponse {

    private Long id;
    private String email;
    private String phone;
    private Role role;
    private LocalDateTime createdAt;

    public AdminUserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
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

    public Role getRole() {
        return role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
