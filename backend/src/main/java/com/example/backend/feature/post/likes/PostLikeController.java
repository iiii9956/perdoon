
package com.example.backend.feature.post.likes;

import com.example.backend.feature.post.likes.dto.PostLikeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
public class PostLikeController {

    private final PostLikeService postLikeService;

    public PostLikeController(PostLikeService postLikeService) {
        this.postLikeService = postLikeService;
    }

    // Получить список пользователей, поставивших лайк
    @GetMapping
    public ResponseEntity<List<PostLikeResponse>> getLikes(
            @PathVariable Long postId
    ) {
        return ResponseEntity.ok(
                postLikeService.getLikes(postId)
        );
    }

    // Поставить лайк
    @PostMapping
    public ResponseEntity<Map<String, String>> likePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal String userId
    ) {
        postLikeService.likePost(
                postId,
                Long.valueOf(userId)
        );

        return ResponseEntity.ok(
                Map.of("message", "Лайк поставлен")
        );
    }

    // Убрать лайк
    @DeleteMapping
    public ResponseEntity<Map<String, String>> unlikePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal String userId
    ) {
        postLikeService.unlikePost(
                postId,
                Long.valueOf(userId)
        );

        return ResponseEntity.ok(
                Map.of("message", "Лайк удалён")
        );
    }

    // Получить количество лайков
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getLikesCount(
            @PathVariable Long postId
    ) {
        return ResponseEntity.ok(
                Map.of(
                        "count",
                        postLikeService.getLikesCount(postId)
                )
        );
    }
}
