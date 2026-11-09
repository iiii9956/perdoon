
package com.example.backend.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public JwtAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {

        // Устанавливаем HTTP-статус 401
        response.setStatus(HttpStatus.UNAUTHORIZED.value());

        // Указываем, что сервер возвращает JSON
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        // Формируем тело ответа
        Map<String, Object> error = Map.of(
                "status", 401,
                "error", "Unauthorized",
                "message", "Необходима авторизация",
                "path", request.getRequestURI()
        );

        // Преобразуем Map в JSON и записываем в ответ
        objectMapper.writeValue(response.getWriter(), error);
    }
}
