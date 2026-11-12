
package com.example.backend.feature.post.dto;

public class UpdatePostRequest {

    private String content;
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
