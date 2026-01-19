package com.a407.sniffythedog.domain.game.exception;

import com.a407.sniffythedog.domain.common.exception.DomainException;

public class GameDomainException extends DomainException {

    public GameDomainException(String message) {
        super(message);
    }

    public GameDomainException(String message, Throwable cause) {
        super(message, cause);
    }
}
