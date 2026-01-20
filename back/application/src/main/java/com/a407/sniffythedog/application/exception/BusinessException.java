package com.a407.sniffythedog.application.exception;

/**
 * 비즈니스 로직 예외의 기본 클래스
 * RuntimeException을 상속하지만, 의미적으로 비즈니스 규칙 위반을 나타냄
 */
public abstract class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
