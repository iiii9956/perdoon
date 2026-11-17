
package com.example.backend.feature.user.dto;

import com.example.backend.feature.user.User;
import java.time.LocalDateTime;

public class PublicUserResponse {

    private Long id;
    private String username;
    private String description;
    private String avatarUrl;
    private LocalDateTime createdAt;

    public PublicUserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.description = user.getDescription();
        this.avatarUrl = user.getAvatarUrl();
        this.createdAt = user.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getDescription() {
        return description;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
