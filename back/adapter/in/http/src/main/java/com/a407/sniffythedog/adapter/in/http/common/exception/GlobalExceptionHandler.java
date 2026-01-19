package com.a407.sniffythedog.adapter.in.http.common.exception;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.application.exception.ApplicationException;
import com.a407.sniffythedog.application.exception.ExceptionType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ApiResponse<Void>> handleApplicationException(ApplicationException e) {
        log.warn("ApplicationException: {} - {}", e.getErrorCode(), e.getMessage());
        return ResponseEntity
            .status(e.getHttpStatusCode())
            .body(ApiResponse.fail(e.getErrorCode(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .orElse(ExceptionType.VALIDATION_ERROR.getMessage());

        log.warn("ValidationException: {}", message);
        return ResponseEntity
            .status(ExceptionType.VALIDATION_ERROR.getHttpStatusCode())
            .body(ApiResponse.fail(ExceptionType.VALIDATION_ERROR.getErrorCode(), message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("IllegalArgumentException: {}", e.getMessage());
        return ResponseEntity
            .status(ExceptionType.BAD_REQUEST.getHttpStatusCode())
            .body(ApiResponse.fail(ExceptionType.BAD_REQUEST.getErrorCode(), e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unhandled Exception: ", e);
        return ResponseEntity
            .status(ExceptionType.INTERNAL_SERVER_ERROR.getHttpStatusCode())
            .body(ApiResponse.fail(
                ExceptionType.INTERNAL_SERVER_ERROR.getErrorCode(),
                ExceptionType.INTERNAL_SERVER_ERROR.getMessage()
            ));
    }
}
