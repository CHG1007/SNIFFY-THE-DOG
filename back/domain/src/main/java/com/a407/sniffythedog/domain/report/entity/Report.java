package com.a407.sniffythedog.domain.report.entity;

import com.a407.sniffythedog.domain.report.enums.ReportStatus;
import com.a407.sniffythedog.domain.report.exception.ReportDomainException;
import com.a407.sniffythedog.domain.report.vo.ReportId;
import com.a407.sniffythedog.domain.report.vo.ReportReason;
import com.a407.sniffythedog.domain.user.vo.UserId;

import java.time.Instant;
import java.util.Objects;

public class Report {

    private final ReportId id;
    private final UserId reporterId;      // 신고자
    private final UserId reportedUserId;  // 피신고자
    private final ReportReason reason;
    private ReportStatus status;
    private final Instant createdAt;
    private Instant processedAt;

    private Report(ReportId id, UserId reporterId, UserId reportedUserId,
                   ReportReason reason, ReportStatus status,
                   Instant createdAt, Instant processedAt) {
        this.id = id;
        this.reporterId = Objects.requireNonNull(reporterId);
        this.reportedUserId = Objects.requireNonNull(reportedUserId);
        this.reason = Objects.requireNonNull(reason);
        this.status = Objects.requireNonNull(status);
        this.createdAt = Objects.requireNonNull(createdAt);
        this.processedAt = processedAt;
    }

    public static Report create(UserId reporterId, UserId reportedUserId, ReportReason reason) {
        if (reporterId.equals(reportedUserId)) {
            throw new ReportDomainException("자기 자신을 신고할 수 없습니다");
        }
        return new Report(null, reporterId, reportedUserId, reason,
                ReportStatus.PENDING, Instant.now(), null);
    }

    public static Report reconstitute(ReportId id, UserId reporterId, UserId reportedUserId,
                                      ReportReason reason, ReportStatus status,
                                      Instant createdAt, Instant processedAt) {
        return new Report(id, reporterId, reportedUserId, reason, status, createdAt, processedAt);
    }

    public void process() {
        if (this.status != ReportStatus.PENDING) {
            throw new ReportDomainException("이미 처리된 신고입니다");
        }
        this.status = ReportStatus.PROCESSED;
        this.processedAt = Instant.now();
    }

    public void dismiss() {
        if (this.status != ReportStatus.PENDING) {
            throw new ReportDomainException("이미 처리된 신고입니다");
        }
        this.status = ReportStatus.DISMISSED;
        this.processedAt = Instant.now();
    }

    public boolean isPending() {
        return this.status == ReportStatus.PENDING;
    }

    // Getters
    public ReportId getId() {
        return id;
    }

    public UserId getReporterId() {
        return reporterId;
    }

    public UserId getReportedUserId() {
        return reportedUserId;
    }

    public ReportReason getReason() {
        return reason;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }
}