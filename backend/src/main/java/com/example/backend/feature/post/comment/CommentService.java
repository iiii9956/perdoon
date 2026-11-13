
package com.example.backend.feature.post.comment;

import com.example.backend.feature.post.comment.dto.CommentResponse;
import com.example.backend.feature.post.comment.dto.CreateCommentRequest;
import com.example.backend.feature.post.comment.dto.UpdateCommentRequest;
import com.example.backend.feature.post.Post;
import com.example.backend.feature.post.PostRepository;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentService(
            CommentRepository commentRepository,
            PostRepository postRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // Получить комментарии публикации
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId) {

        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Публикация не найдена"
            );
        }

        return commentRepository
                .findAllByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(CommentResponse::new)
                .toList();
    }

    // Создать комментарий
    @Transactional
    public CommentResponse createComment(
            Long postId,
            CreateCommentRequest request,
            Long userId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Публикация не найдена"
                ));

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        String content = normalize(request.getContent());
        validateContent(content);

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setContent(content);

        Comment savedComment = commentRepository.save(comment);

        return new CommentResponse(savedComment);
    }

    // Редактировать свой комментарий
    @Transactional
    public CommentResponse updateComment(
            Long postId,
            Long commentId,
            UpdateCommentRequest request,
            Long userId) {

        Comment comment = findComment(postId, commentId);

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Нельзя редактировать чужой комментарий"
            );
        }

        String content = normalize(request.getContent());
        validateContent(content);

        comment.setContent(content);

        Comment updatedComment = commentRepository.save(comment);

        return new CommentResponse(updatedComment);
    }

    // Удалить свой комментарий
    @Transactional
    public void deleteComment(
            Long postId,
            Long commentId,
            Long userId) {

        Comment comment = findComment(postId, commentId);

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Нельзя удалить чужой комментарий"
            );
        }

        commentRepository.delete(comment);
    }

    // Найти комментарий и проверить его принадлежность публикации
    private Comment findComment(Long postId, Long commentId) {

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Комментарий не найден"
                ));

        if (!comment.getPost().getId().equals(postId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Комментарий не принадлежит этой публикации"
            );
        }

        return comment;
    }

    // Убрать пробелы по краям
    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    // Проверить текст комментария
    private void validateContent(String content) {

        if (content == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Комментарий не может быть пустым"
            );
        }

        if (content.length() > 500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Комментарий не должен превышать 500 символов"
            );
        }
    }
}
