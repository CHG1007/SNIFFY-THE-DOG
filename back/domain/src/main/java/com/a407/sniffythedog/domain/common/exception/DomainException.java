package com.a407.sniffythedog.domain.common.exception;

/**
 * 도메인 계층 예외의 기본 클래스
 * 도메인 규칙 위반 시 발생하는 비즈니스 예외
 */
public abstract class DomainException extends RuntimeException {

    public DomainException(String message) {
        super(message);
    }

    public DomainException(String message, Throwable cause) {
        super(message, cause);
    }
}
