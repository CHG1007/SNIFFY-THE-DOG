package com.a407.sniffythedog.domain.user.exception;

import com.a407.sniffythedog.domain.common.exception.DomainException;

public class UserDomainException extends DomainException {

    public UserDomainException(String message) {
        super(message);
    }

    public UserDomainException(String message, Throwable cause) {
        super(message, cause);
    }
}
