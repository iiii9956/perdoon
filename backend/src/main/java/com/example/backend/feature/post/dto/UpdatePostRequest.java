
package com.example.backend.feature.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdatePostRequest {

    @NotBlank(message = "Текст публикации не может быть пустым")
    @Size(max = 5000, message = "Публикация слишком длинная")
    private String content;
    @Size(max = 1000, message = "url слишком длинный")
    private String imageUrl;

    public UpdatePostRequest() {
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
