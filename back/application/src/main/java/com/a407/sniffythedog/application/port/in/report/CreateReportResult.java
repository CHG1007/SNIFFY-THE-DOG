package com.a407.sniffythedog.application.port.in.report;

import java.time.Instant;

public record CreateReportResult(
    Long reportId,
    Instant createdAt
) {
}
