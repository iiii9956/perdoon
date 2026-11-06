
package com.example.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Повторяющаяся почта
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiAuthError> handleEmailAlreadyExists(
            EmailAlreadyExistsException exception) {

        ApiAuthError error = new ApiAuthError(
                409,
                exception.getMessage()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // Повторяющийся телефон
    @ExceptionHandler(PhoneAlreadyExistsException.class)
    public ResponseEntity<ApiAuthError> handlePhoneAlreadyExists(
            PhoneAlreadyExistsException exception) {

        ApiAuthError error = new ApiAuthError(
                409,
                exception.getMessage()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // Ошибки проверки данных: например, пароль слишком короткий
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiAuthError> handleBadRequest(
            IllegalArgumentException exception) {

        ApiAuthError error = new ApiAuthError(
                400,
                exception.getMessage()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Другие нарушения ограничений базы данных
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiAuthError> handleDatabaseConflict(
            DataIntegrityViolationException exception) {

        ApiAuthError error = new ApiAuthError(
                409,
                "Нарушено ограничение базы данных. Проверьте введенные данные."
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
}

