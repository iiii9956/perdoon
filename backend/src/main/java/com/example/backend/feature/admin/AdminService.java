
package com.example.backend.feature.admin;


import com.example.backend.feature.post.Post;
import com.example.backend.feature.post.PostRepository;
import com.example.backend.feature.post.comment.CommentRepository;
import com.example.backend.feature.post.likes.PostLikeRepository;
import com.example.backend.feature.role.Role;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;

    public AdminService(UserRepository userRepository, PostRepository postRepository, CommentRepository commentRepository, PostLikeRepository postLikeRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
    }

    @Transactional
    public AdminUserResponse changeUserRole(
            Long targetUserId,
            String currentAdminId,
            Role newRole
    ) {

        // Проверяем, что новая роль указана
        if (newRole == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Необходимо указать новую роль"
            );
        }

        // Не разрешаем администратору менять собственную роль
        if (targetUserId.equals(Long.parseLong(currentAdminId))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Нельзя изменять собственную роль"
            );
        }

        // Ищем пользователя, которому меняем роль
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        // Если пользователь уже имеет нужную роль, ничего не меняем
        if (user.getRole() == newRole) {
            return new AdminUserResponse(user);
        }

        // Не разрешаем понизить последнего администратора
        if (user.getRole() == Role.ADMIN && newRole != Role.ADMIN) {

            long adminCount = userRepository.countByRole(Role.ADMIN);

            if (adminCount <= 1) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Нельзя изменить роль последнего администратора"
                );
            }
        }

        // Назначаем новую роль
        user.setRole(newRole);

        // Сохраняем изменения в базе данных
        User updatedUser = userRepository.save(user);

        return new AdminUserResponse(updatedUser);
    }
    @Transactional
    public void deleteUser(Long targetUserId, String currentAdminId) {

        // Запрещаем удалять собственный аккаунт
        if (targetUserId.equals(Long.parseLong(currentAdminId))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Нельзя удалить собственный аккаунт"
            );
        }

        // Ищем пользователя
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        // Не разрешаем удалить последнего администратора
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);

            if (adminCount <= 1) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Нельзя удалить последнего администратора"
                );
            }
        }

        // Получаем все посты пользователя
        List<Post> posts =
                postRepository.findAllByAuthorIdOrderByCreatedAtDesc(targetUserId);

        // Удаляем комментарии и лайки под его постами
        for (Post post : posts) {
            commentRepository.deleteAllByPostId(post.getId());
            postLikeRepository.deleteAllByPostId(post.getId());
        }

        // Удаляем комментарии и лайки пользователя под чужими постами
        commentRepository.deleteAllByAuthorId(targetUserId);
        postLikeRepository.deleteAllByUserId(targetUserId);

        // Удаляем посты пользователя
        postRepository.deleteAll(posts);

        // Удаляем аккаунт
        userRepository.delete(user);
    }
}
