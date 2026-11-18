
package com.example.backend.feature.user;

import com.example.backend.feature.user.dto.UpdateProfileRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserCleanupService userCleanupService;

    public UserService(UserRepository userRepository, UserCleanupService userCleanupService) {
        this.userRepository = userRepository;
        this.userCleanupService = userCleanupService;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public void deleteById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));
        userCleanupService.deleteUserAndRelatedData(user);
    }

    public long countUsers() {
        return userRepository.count();
    }

    // Изменить собственный профиль
    @Transactional
    public User updateProfile(Long id, UpdateProfileRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        String username = request.getUsername() == null
                ? ""
                : request.getUsername().trim();

        if (username.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Никнейм обязателен"
            );
        }

        if (username.length() > 30) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Никнейм не должен превышать 30 символов"
            );
        }

        if (userRepository.existsByUsernameAndIdNot(username, id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Этот никнейм уже занят"
            );
        }

        String description = request.getDescription();
        String avatarUrl = request.getAvatarUrl();

        if (description != null && description.length() > 500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Описание не должно превышать 500 символов"
            );
        }

        if (avatarUrl != null && avatarUrl.length() > 1000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ссылка на аватар слишком длинная"
            );
        }

        user.setUsername(username);
        user.setDescription(description);
        user.setAvatarUrl(avatarUrl);

        return userRepository.save(user);
    }
}
