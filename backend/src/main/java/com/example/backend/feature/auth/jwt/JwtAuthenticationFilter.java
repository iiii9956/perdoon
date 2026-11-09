
package com.example.backend.feature.auth.jwt;

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

    // Внедряем JwtService через конструктор
    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Получаем заголовок Authorization из HTTP-запроса
        String authorizationHeader = request.getHeader("Authorization");

        // Если заголовка нет или он не начинается с Bearer,
        // пропускаем запрос дальше.
        // Защищённость запроса будет определять SecurityConfig.
        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // Убираем слово Bearer и оставляем только сам JWT
        String token = authorizationHeader.substring(7);

        // Проверяем корректность токена
        if (!jwtService.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Получаем ID пользователя из токена
        Long userId = jwtService.getUserIdFromToken(token);

        // Создаём объект авторизации для Spring Security
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userId.toString(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                );

        // Записываем авторизацию в SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Передаём запрос дальше по цепочке фильтров
        filterChain.doFilter(request, response);
    }
}
