
package com.example.backend.feature.post.likes;

import com.example.backend.feature.post.likes.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    // Найти лайк конкретного пользователя на конкретной публикации
    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);

    // Получить все лайки публикации, от новых к старым
    List<PostLike> findAllByPostIdOrderByCreatedAtDesc(Long postId);

    // Проверить, поставил ли пользователь лайк этой публикации
    boolean existsByPostIdAndUserId(Long postId, Long userId);

    // Посчитать количество лайков публикации
    long countByPostId(Long postId);

    void deleteAllByPostId(Long postId);
}

