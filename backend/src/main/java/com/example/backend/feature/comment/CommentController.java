
package com.example.backend.feature.comment;

import com.example.backend.feature.comment.dto.CommentResponse;
import com.example.backend.feature.comment.dto.CreateCommentRequest;
import com.example.backend.feature.comment.dto.UpdateCommentRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // Получить комментарии публикации
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long postId) {

        return ResponseEntity.ok(
                commentService.getComments(postId)
        );
    }

    // Создать комментарий
    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal String userId) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.createComment(
                        postId,
                        request,
                        Long.valueOf(userId)
                ));
    }

    // Редактировать комментарий
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal String userId) {

        return ResponseEntity.ok(
                commentService.updateComment(
                        postId,
                        commentId,
                        request,
                        Long.valueOf(userId)
                )
        );
    }

    // Удалить комментарий
    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal String userId) {

        commentService.deleteComment(
                postId,
                commentId,
                Long.valueOf(userId)
        );

        return ResponseEntity.ok("Комментарий успешно удалён");
    }
}
