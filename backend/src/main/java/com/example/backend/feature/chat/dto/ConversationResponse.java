package com.example.backend.feature.chat.dto;

import com.example.backend.feature.user.User;

import java.time.LocalDateTime;

public class ConversationResponse {

    private Long id;
    private Long companionId;
    private String companionUsername;
    private String companionAvatarUrl;
    private String lastMessage;
    private LocalDateTime updatedAt;

    public ConversationResponse(
            Long id,
            User companion,
            String lastMessage,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.companionId = companion.getId();
        this.companionUsername = companion.getUsername();
        this.companionAvatarUrl = companion.getAvatarUrl();
        this.lastMessage = lastMessage;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getCompanionId() {
        return companionId;
    }

    public String getCompanionUsername() {
        return companionUsername;
    }

    public String getCompanionAvatarUrl() {
        return companionAvatarUrl;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
