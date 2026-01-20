package com.a407.sniffythedog.application.report.in;

import com.a407.sniffythedog.application.common.PageInfo;

import java.time.Instant;
import java.util.List;

public record GetReportListResult(
    List<ReportItem> reports,
    PageInfo pageInfo
) {
    public record ReportItem(
        Long reportId,
        Long reporterId,
        String reporterNickname,
        Long reportedUserId,
        String reportedUserNickname,
        String reason,
        String status,
        Instant createdAt,
        Instant processedAt
    ) {}
}
