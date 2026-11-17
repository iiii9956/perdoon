
package com.example.backend.feature.post.dto;

public class CreatePostRequest {

    private String content;
    private String imageUrl;

    public CreatePostRequest() {
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
