package com.example.backend.feature.auth.login;

import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Получаем необходимые объекты через конструктор
    public LoginService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Метод авторизации пользователя
    public User login(LoginRequest request) {

        // Получаем логин и пароль из запроса
        String login = request.getLogin();
        String password = request.getPassword();

        // Проверяем, что поля заполнены
        if (login == null || login.isBlank()) {
            throw new IllegalArgumentException("Введите почту или номер телефона");
        }

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Введите пароль");
        }

        // Убираем лишние пробелы
        login = login.trim();

        // Ищем пользователя по почте или номеру телефона
        User user;

        if (login.contains("@")) {
            user = userRepository.findByEmail(login.toLowerCase())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Неверный логин или пароль"));
        } else {
            user = userRepository.findByPhone(login)
                    .orElseThrow(() ->
                            new IllegalArgumentException("Неверный логин или пароль"));
        }

        // Сравниваем введённый пароль с сохранённым хешем
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Неверный логин или пароль");
        }

        // Если всё правильно, возвращаем пользователя
        return user;
    }
}
