
package com.example.backend.feature.user.dto;

import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @Size(max = 30, message = "Имя слишком длинное")
    private String username;
    @Size(max = 500, message = "Описание слишком длинное")
    private String description;
    @Size(max = 1000, message = "url слишком длинный")
    private String avatarUrl;

    public UpdateProfileRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
