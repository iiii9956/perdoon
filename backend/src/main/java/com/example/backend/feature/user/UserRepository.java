
package com.example.backend.feature.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Поиск пользователя по электронной почте
    Optional<User> findByEmail(String email);

    // Поиск пользователя по номеру телефона
    Optional<User> findByPhone(String phone);

    // Проверка, существует ли пользователь с такой почтой
    boolean existsByEmail(String email);

    // Проверка, существует ли пользователь с таким номером
    boolean existsByPhone(String phone);
}

