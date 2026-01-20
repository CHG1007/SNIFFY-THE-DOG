package com.a407.sniffythedog.domain.report.vo;

import java.util.Objects;

public record ReportReason(String value) {

    private static final int MIN_LENGTH = 1;
    private static final int MAX_LENGTH = 500;

    public ReportReason {
        Objects.requireNonNull(value, "ReportReason value must not be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("ReportReason must not be blank");
        }
        if (value.length() < MIN_LENGTH || value.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    String.format("ReportReason must be between %d and %d characters", MIN_LENGTH, MAX_LENGTH));
        }
    }

    public static ReportReason of(String value) {
        return new ReportReason(value);
    }
}