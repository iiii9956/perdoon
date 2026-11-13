
package com.example.backend.feature.post.comment;

import com.example.backend.feature.post.Post;
import com.example.backend.feature.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Публикация, к которой относится комментарий
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    // Пользователь, написавший комментарий
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    // Текст комментария
    @Column(nullable = false, length = 2000)
    private String content;

    // Дата создания
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Дата изменения
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Comment() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Post getPost() {
        return post;
    }

    public User getAuthor() {
        return author;
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

    public void setPost(Post post) {
        this.post = post;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
