
package com.example.backend.feature.post.likes;

import com.example.backend.feature.post.Post;
import com.example.backend.feature.post.PostRepository;
import com.example.backend.feature.post.likes.dto.PostLikeResponse;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostLikeService(
            PostLikeRepository postLikeRepository,
            PostRepository postRepository,
            UserRepository userRepository
    ) {
        this.postLikeRepository = postLikeRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // Получить все лайки публикации
    @Transactional(readOnly = true)
    public List<PostLikeResponse> getLikes(Long postId) {

        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Публикация не найдена"
            );
        }

        return postLikeRepository
                .findAllByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(like -> new PostLikeResponse(
                        like.getUser().getId(),
                        like.getUser().getUsername(),
                        like.getUser().getAvatarUrl(),
                        like.getCreatedAt()
                ))
                .toList();
    }

    // Поставить лайк
    @Transactional
    public void likePost(Long postId, Long userId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Публикация не найдена"
                ));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        // Проверяем, не поставил ли пользователь лайк раньше
        if (postLikeRepository.existsByPostIdAndUserId(postId, userId)) {
            return;
        }

        PostLike like = new PostLike();
        like.setPost(post);
        like.setUser(user);

        postLikeRepository.save(like);
    }

    // Убрать свой лайк
    @Transactional
    public void unlikePost(Long postId, Long userId) {

        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Публикация не найдена"
            );
        }

        postLikeRepository
                .findByPostIdAndUserId(postId, userId)
                .ifPresent(postLikeRepository::delete);
    }

    // Получить количество лайков
    @Transactional(readOnly = true)
    public long getLikesCount(Long postId) {

        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Публикация не найдена"
            );
        }

        return postLikeRepository.countByPostId(postId);
    }
}
