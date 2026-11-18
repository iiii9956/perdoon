package com.example.backend.config;

import com.example.backend.exception.JwtAccessDeniedHandler;
import com.example.backend.exception.JwtAuthenticationEntryPoint;
import com.example.backend.feature.auth.jwt.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            JwtAccessDeniedHandler jwtAccessDeniedHandler
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.jwtAccessDeniedHandler = jwtAccessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        try {
            http
                    // Разрешаем CORS-запросы с фронтенда по правилам ниже
                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))

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
                            // Доступ к административным запросам только для ADMIN
                            .requestMatchers("/api/admin/**").hasRole("ADMIN")
                            // Остальные запросы требуют авторизации
                            .anyRequest().authenticated()
                    )
                    .exceptionHandling(exception -> exception
                            .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                            .accessDeniedHandler(jwtAccessDeniedHandler)
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

            return http.build();

        } catch (Exception e) {
            System.out.println("Ошибка настройки безопасности: " + e.getMessage());
            throw new RuntimeException("Не удалось настроить безопасность приложения", e);
        }
    }

    // Конфигурация CORS: разрешаем запросы с Vite (5173)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}