
package com.example.backend.feature.auth.jwt;

import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    // Внедряем сервис JWT и репозиторий пользователей
    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Получаем заголовок Authorization
        String authorizationHeader = request.getHeader("Authorization");

        // Проверяем наличие Bearer-токена
        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // Извлекаем JWT из заголовка
        String token = authorizationHeader.substring(7);

        // Проверяем подпись и срок действия JWT
        if (!jwtService.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Получаем ID пользователя из JWT
        Long userId;

        try {
            userId = jwtService.getUserIdFromToken(token);
        } catch (IllegalArgumentException e) {
            // Если ID некорректен, продолжаем без авторизации
            filterChain.doFilter(request, response);
            return;
        }

        // Ищем пользователя в PostgreSQL
        User user = userRepository.findById(userId)
                .orElse(null);

        // Если пользователя нет или у него не назначена роль,
        // не создаём авторизацию
        if (user == null || user.getRole() == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Получаем настоящую роль пользователя из базы
        String role = "ROLE_" + user.getRole().name();

        // Создаём объект авторизации Spring Security
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getId().toString(),
                        null,
                        List.of(new SimpleGrantedAuthority(role))
                );

        // Сохраняем авторизацию в SecurityContext
        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        // Передаём запрос дальше
        filterChain.doFilter(request, response);
    }
}

