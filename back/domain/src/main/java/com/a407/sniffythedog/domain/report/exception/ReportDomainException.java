package com.a407.sniffythedog.domain.report.exception;

import com.a407.sniffythedog.domain.common.exception.DomainException;

public class ReportDomainException extends DomainException {

    public ReportDomainException(String message) {
        super(message);
    }

    public ReportDomainException(String message, Throwable cause) {
        super(message, cause);
    }
}
