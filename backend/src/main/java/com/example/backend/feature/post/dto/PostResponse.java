
package com.example.backend.feature.post.dto;

import com.example.backend.feature.post.Post;

import java.time.LocalDateTime;

public class PostResponse {

    private Long id;

    private Long authorId;
    private String authorUsername;
    private String authorAvatarUrl;

    private String content;
    private String imageUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PostResponse(Post post) {
        this.id = post.getId();

        this.authorId = post.getAuthor().getId();
        this.authorUsername = post.getAuthor().getUsername();
        this.authorAvatarUrl = post.getAuthor().getAvatarUrl();

        this.content = post.getContent();
        this.imageUrl = post.getImageUrl();

        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public String getAuthorAvatarUrl() {
        return authorAvatarUrl;
    }

    public String getContent() {
        return content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
