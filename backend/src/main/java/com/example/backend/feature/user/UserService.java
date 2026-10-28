
package com.example.backend.feature.user;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Найти пользователя по электронной почте
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Проверить, существует ли пользователь с таким email
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // Сохранить пользователя
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Найти пользователя по ID
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // Получить всех пользователей
    public List<User> findAll() {
        return userRepository.findAll();
    }

    // Удалить пользователя по ID
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    // Получить количество пользователей
    public long countUsers() {
        return userRepository.count();
    }
}

