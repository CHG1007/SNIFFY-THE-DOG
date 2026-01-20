package com.a407.sniffythedog.adapter.in.http.dto.response;

import java.time.Instant;

public record CreateReportResponse(
    Long reportId,
    Instant createdAt
) {
}
