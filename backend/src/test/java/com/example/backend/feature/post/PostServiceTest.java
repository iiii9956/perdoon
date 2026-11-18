package com.example.backend.feature.post;

import com.example.backend.feature.post.comment.CommentRepository;
import com.example.backend.feature.post.dto.CreatePostRequest;
import com.example.backend.feature.post.dto.PostResponse;
import com.example.backend.feature.post.likes.PostLikeRepository;
import com.example.backend.feature.role.Role;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @InjectMocks
    private PostService postService;

    @Test
    void rejectsEmptyPost() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, Role.USER)));

        CreatePostRequest request = new CreatePostRequest();
        request.setImageUrl("  ");

        assertThrows(
                ResponseStatusException.class,
                () -> postService.createPost(request, 1L)
        );
    }

    @Test
    void allowsPostWithOnlyImage() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, Role.USER)));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreatePostRequest request = new CreatePostRequest();
        request.setImageUrl(" https://cdn.example/cat.png ");

        PostResponse response = postService.createPost(request, 1L);

        assertNull(response.getContent());
        assertEquals("https://cdn.example/cat.png", response.getImageUrl());
    }

    @Test
    void forbidsDeletingSomeoneElsesPost() {
        Post post = new Post();
        post.setAuthor(user(2L, Role.USER));
        when(postRepository.findById(9L)).thenReturn(Optional.of(post));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, Role.USER)));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> postService.deletePost(9L, 1L)
        );

        assertEquals(403, exception.getStatusCode().value());
    }

    private User user(Long id, Role role) {
        User user = org.mockito.Mockito.mock(User.class);
        org.mockito.Mockito.lenient().when(user.getId()).thenReturn(id);
        org.mockito.Mockito.lenient().when(user.getRole()).thenReturn(role);
        return user;
    }
}
