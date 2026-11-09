
package com.example.backend.config;

import com.example.backend.feature.auth.jwt.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// @Configuration — сообщает Spring, что класс содержит настройки приложения
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // Передаём JWT-фильтр через конструктор
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {

        try {

            // Настраиваем безопасность HTTP-запросов
            http

                    // Отключаем CSRF-защиту для REST API
                    .csrf(AbstractHttpConfigurer::disable)

                    // Отключаем стандартную форму входа Spring Security
                    .formLogin(AbstractHttpConfigurer::disable)

                    // Отключаем HTTP Basic авторизацию
                    .httpBasic(AbstractHttpConfigurer::disable)

                    // Настраиваем правила доступа
                    .authorizeHttpRequests(auth -> auth

                            // Разрешаем регистрацию и авторизацию без токена
                            .requestMatchers(
                                    "/api/auth/register",
                                    "/api/auth/login"
                            ).permitAll()

                            // Остальные запросы требуют авторизации
                            .anyRequest().authenticated()
                    )

                    // Отключаем хранение пользовательских сессий
                    .sessionManagement(session -> session
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    )

                    // Добавляем JWT-фильтр перед стандартным фильтром входа
                    .addFilterBefore(
                            jwtAuthenticationFilter,
                            UsernamePasswordAuthenticationFilter.class
                    );

            // Создаём цепочку фильтров безопасности
            return http.build();

        } catch (Exception e) {

            // Выводим информацию об ошибке в консоль
            System.out.println(
                    "Ошибка настройки безопасности: " + e.getMessage()
            );

            // Передаём исключение дальше
            throw new RuntimeException(
                    "Не удалось настроить безопасность приложения",
                    e
            );
        }
    }
}
