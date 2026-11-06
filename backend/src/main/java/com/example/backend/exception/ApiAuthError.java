package com.example.backend.exception;

public class ApiAuthError {
        private int status;
        private String message;

        public ApiAuthError(int status, String message) {
            this.status = status;
            this.message = message;
        }

        public int getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }
    }
