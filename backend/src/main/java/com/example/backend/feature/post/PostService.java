
package com.example.backend.feature.post;

import com.example.backend.feature.post.dto.CreatePostRequest;
import com.example.backend.feature.post.dto.UpdatePostRequest;
import com.example.backend.feature.post.dto.PostResponse;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository,
                       UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // Получить ленту постов всех пользователей, кроме своих
    @Transactional(readOnly = true)
    public List<PostResponse> getFeed(Long userId) {

        return postRepository
                .findAllByAuthorIdNotOrderByCreatedAtDesc(userId)
                .stream()
                .map(PostResponse::new)
                .toList();
    }

    // Получить собственные публикации
    @Transactional(readOnly = true)
    public List<PostResponse> getMyPosts(Long userId) {

        return postRepository
                .findAllByAuthorIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(PostResponse::new)
                .toList();
    }

    // Создать новую публикацию
    @Transactional
    public PostResponse createPost(CreatePostRequest request, Long userId) {

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        String content = normalize(request.getContent());
        String imageUrl = normalize(request.getImageUrl());

        validatePost(content, imageUrl);

        Post post = new Post();

        post.setAuthor(author);
        post.setContent(content);
        post.setImageUrl(imageUrl);

        Post savedPost = postRepository.save(post);

        return new PostResponse(savedPost);
    }

    // Редактировать собственную публикацию
    @Transactional
    public PostResponse updatePost(Long postId,
                                   UpdatePostRequest request,
                                   Long userId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Публикация не найдена"
                ));

        // Проверяем, принадлежит ли публикация пользователю
        if (!post.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Нельзя редактировать чужую публикацию"
            );
        }

        String content = normalize(request.getContent());
        String imageUrl = normalize(request.getImageUrl());

        validatePost(content, imageUrl);

        post.setContent(content);
        post.setImageUrl(imageUrl);

        Post updatedPost = postRepository.save(post);

        return new PostResponse(updatedPost);
    }

    // Удалить собственную публикацию
    @Transactional
    public void deletePost(Long postId, Long userId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Публикация не найдена"
                ));

        // Проверяем владельца публикации
        if (!post.getAuthor().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Нельзя удалить чужую публикацию"
            );
        }

        postRepository.delete(post);
    }

    // Убираем лишние пробелы
    private String normalize(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    // Проверяем содержимое публикации
    private void validatePost(String content, String imageUrl) {

        if (content == null && imageUrl == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Публикация должна содержать текст или изображение"
            );
        }

        if (content != null && content.length() > 5000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Текст публикации не должен превышать 5000 символов"
            );
        }

        if (imageUrl != null && imageUrl.length() > 1000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ссылка на изображение слишком длинная"
            );
        }
    }
}
