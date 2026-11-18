
package com.example.backend.feature.post.likes.dto;

import java.time.LocalDateTime;

public class PostLikeResponse {

    private Long userId;
    private String username;
    private String avatarUrl;
    private LocalDateTime createdAt;

    public PostLikeResponse(
            Long userId,
            String username,
            String avatarUrl,
            LocalDateTime createdAt
    ) {
        this.userId = userId;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
