package com.example.backend.feature.chat;

import com.example.backend.exception.ApiError;

import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@ControllerAdvice
public class ChatSocketExceptionHandler {

    @MessageExceptionHandler
    @SendToUser(value = "/queue/errors", broadcast = false)
    public ApiError handle(Exception exception) {
        if (exception instanceof ResponseStatusException response) {
            String message = response.getReason() != null
                    ? response.getReason()
                    : "Ошибка чата";
            return new ApiError(response.getStatusCode().value(), message);
        }

        return new ApiError(HttpStatus.BAD_REQUEST.value(), "Не удалось отправить сообщение");
    }
}
