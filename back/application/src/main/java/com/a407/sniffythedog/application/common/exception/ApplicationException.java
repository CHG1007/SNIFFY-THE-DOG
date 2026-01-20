package com.a407.sniffythedog.application.common.exception;

public class ApplicationException extends BusinessException {

    private final String errorCode;
    private final int httpStatusCode;

    public ApplicationException(String errorCode, int httpStatusCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatusCode = httpStatusCode;
    }

    public static ApplicationException of(ExceptionType type) {
        return new ApplicationException(
                type.getErrorCode(),
                type.getHttpStatusCode(),
                type.getMessage()
        );
    }

    public static ApplicationException of(ExceptionType type, String message) {
        return new ApplicationException(
                type.getErrorCode(),
                type.getHttpStatusCode(),
                message
        );
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatusCode() {
        return httpStatusCode;
    }
}
