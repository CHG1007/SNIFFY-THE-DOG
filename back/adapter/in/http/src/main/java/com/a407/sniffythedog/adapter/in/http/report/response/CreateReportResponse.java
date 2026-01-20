package com.a407.sniffythedog.adapter.in.http.report.response;

import java.time.Instant;

public record CreateReportResponse(
    Long reportId,
    Instant createdAt
) {
}