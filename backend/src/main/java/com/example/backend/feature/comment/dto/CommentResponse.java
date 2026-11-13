
package com.example.backend.feature.comment.dto;

import com.example.backend.feature.comment.Comment;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private Long postId;
    private Long authorId;
    private String authorUsername;
    private String authorAvatarUrl;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.postId = comment.getPost().getId();
        this.authorId = comment.getAuthor().getId();
        this.authorUsername = comment.getAuthor().getUsername();
        this.authorAvatarUrl = comment.getAuthor().getAvatarUrl();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getPostId() {
        return postId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
