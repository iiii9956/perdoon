package com.example.backend.feature.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Найти пользователя по электронной почте
    Optional<User> findByEmail(String email);

    // Проверить, существует ли пользователь с такой электронной почтой
    boolean existsByEmail(String email);
}
