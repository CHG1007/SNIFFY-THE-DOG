package com.a407.sniffythedog.domain.report.vo;

import java.util.Objects;

public record ReportId(Long value) {

    public ReportId {
        Objects.requireNonNull(value, "ReportId value must not be null");
    }

    public static ReportId of(Long value) {
        return new ReportId(value);
    }
}
