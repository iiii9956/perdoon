
package com.example.backend.feature.auth.register;

import com.example.backend.feature.auth.register.RegisterRequest;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.exception.EmailAlreadyExistsException;
import com.example.backend.exception.PhoneAlreadyExistsException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest request) {

        // Получаем почту и телефон
        String email = request.getEmail();
        String phone = request.getPhone();
        String password = request.getPassword();

        // Убираем лишние пробелы
        if (email != null) {
            email = email.trim().toLowerCase();
        }

        if (phone != null) {
            phone = phone.trim();
        }

        // Пустые строки заменяем на null
        if (email != null && email.isBlank()) {
            email = null;
        }

        if (phone != null && phone.isBlank()) {
            phone = null;
        }

        // Проверяем наличие почты или телефона
        if (email == null && phone == null) {
            throw new IllegalArgumentException(
                    "Укажите почту или номер телефона"
            );
        }


        if (email != null && userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(
                    "Пользователь с такой почтой уже существует"
            );
        }

        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new PhoneAlreadyExistsException(
                    "Пользователь с таким номером уже существует"
            );
        }



        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException(
                    "Пароль должен содержать минимум 8 символов"
            );
        }

        if (password.length() > 64) {
            throw new IllegalArgumentException(
                    "Пароль не должен превышать 64 символа"
            );
        }


        // Создаём хеш пароля
        String passwordHash = passwordEncoder.encode(password);

        // Создаём пользователя
        User user = new User(email, phone, passwordHash);

        // Сохраняем пользователя в базе данных
        return userRepository.save(user);
    }
}

