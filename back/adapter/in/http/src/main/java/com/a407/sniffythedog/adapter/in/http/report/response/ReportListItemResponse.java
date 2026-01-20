package com.a407.sniffythedog.adapter.in.http.report.response;

import com.a407.sniffythedog.application.report.in.GetReportListResult;

import java.time.Instant;

public record ReportListItemResponse(
    Long reportId,
    UserInfo reporter,
    UserInfo reportedUser,
    String reason,
    String status,
    Instant createdAt,
    Instant processedAt
) {
    public record UserInfo(
        Long id,
        String nickname
    ) {}

    public static ReportListItemResponse from(GetReportListResult.ReportItem item) {
        return new ReportListItemResponse(
            item.reportId(),
            new UserInfo(item.reporterId(), item.reporterNickname()),
            new UserInfo(item.reportedUserId(), item.reportedUserNickname()),
            item.reason(),
            item.status(),
            item.createdAt(),
            item.processedAt()
        );
    }
}
