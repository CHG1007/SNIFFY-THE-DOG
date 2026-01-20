package com.a407.sniffythedog.application.report.in;

import java.time.Instant;

public record CreateReportResult(
    Long reportId,
    Instant createdAt
) {
}
