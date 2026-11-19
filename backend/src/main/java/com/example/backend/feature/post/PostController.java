
package com.example.backend.feature.post;

import com.example.backend.feature.post.dto.CreatePostRequest;
import com.example.backend.feature.post.dto.UpdatePostRequest;
import com.example.backend.feature.post.dto.PostResponse;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // Получить ленту публикаций
    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed(
            @AuthenticationPrincipal String userId) {

        return ResponseEntity.ok(
                postService.getFeed(Long.valueOf(userId))
        );
    }

    // Получить собственные публикации
    @GetMapping("/my")
    public ResponseEntity<List<PostResponse>> getMyPosts(
            @AuthenticationPrincipal String userId) {

        return ResponseEntity.ok(
                postService.getMyPosts(Long.valueOf(userId))
        );
    }

    // Создать публикацию
    @PostMapping
    public ResponseEntity<PostResponse> createPost(
           @Valid @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal String userId) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.createPost(
                        request,
                        Long.valueOf(userId)
                ));
    }

    // Изменить собственную публикацию
    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
         @Valid   @RequestBody UpdatePostRequest request,
            @AuthenticationPrincipal String userId) {

        return ResponseEntity.ok(
                postService.updatePost(
                        id,
                        request,
                        Long.valueOf(userId)
                )
        );
    }

    // Удалить собственную публикацию
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal String userId) {

        postService.deletePost(id, Long.valueOf(userId));

        return ResponseEntity.ok("Публикация успешно удалена");
    }
}
