package com.a407.sniffythedog.adapter.out.rdb.report.mapper;

import com.a407.sniffythedog.adapter.out.rdb.report.entity.ReportEntity;
import com.a407.sniffythedog.domain.report.entity.Report;
import com.a407.sniffythedog.domain.report.vo.ReportId;
import com.a407.sniffythedog.domain.report.vo.ReportReason;
import com.a407.sniffythedog.domain.user.vo.UserId;

public class ReportMapper {

    private ReportMapper() {
    }

    public static ReportEntity toEntity(Report report) {
        return new ReportEntity(
            report.getId() != null ? report.getId().value() : null,
            report.getReporterId().value(),
            report.getReportedUserId().value(),
            report.getReason().value(),
            report.getStatus(),
            report.getCreatedAt(),
            report.getProcessedAt()
        );
    }

    public static Report toDomain(ReportEntity entity) {
        return Report.reconstitute(
            ReportId.of(entity.getId()),
            UserId.of(entity.getReporterId()),
            UserId.of(entity.getReportedUserId()),
            ReportReason.of(entity.getReason()),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getProcessedAt()
        );
    }
}
