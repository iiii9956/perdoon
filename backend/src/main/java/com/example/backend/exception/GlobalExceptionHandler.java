
package com.example.backend.exception;

import io.jsonwebtoken.JwtException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Повторяющаяся почта
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailAlreadyExists(
            EmailAlreadyExistsException exception) {

        ApiError error = new ApiError(409, exception.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // Повторяющийся телефон
    @ExceptionHandler(PhoneAlreadyExistsException.class)
    public ResponseEntity<ApiError> handlePhoneAlreadyExists(
            PhoneAlreadyExistsException exception) {

        ApiError error = new ApiError(409, exception.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiError> handleInvalidToken(JwtException exception) {
        ApiError error = new ApiError(401, "Недействительный токен");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // Ошибки проверки данных
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleBadRequest(
            IllegalArgumentException exception) {

        ApiError error = new ApiError(400, exception.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Нарушения ограничений базы данных
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDatabaseConflict(
            DataIntegrityViolationException exception) {

        ApiError error = new ApiError(
                409,
                "Нарушено ограничение базы данных. Проверьте введенные данные."
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // Ошибки, возникающие в сервисах
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(
            ResponseStatusException exception) {

        int status = exception.getStatusCode().value();

        String message = exception.getReason() != null
                ? exception.getReason()
                : "Произошла ошибка";

        ApiError error = new ApiError(status, message);

        return ResponseEntity.status(exception.getStatusCode()).body(error);
    }
}
