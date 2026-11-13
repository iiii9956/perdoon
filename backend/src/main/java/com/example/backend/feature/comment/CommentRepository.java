
package com.example.backend.feature.comment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Получить комментарии конкретной публикации
    List<Comment> findAllByPostIdOrderByCreatedAtAsc(Long postId);

    // Получить комментарии конкретного пользователя
    List<Comment> findAllByAuthorIdOrderByCreatedAtDesc(Long authorId);
}
