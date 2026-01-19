package com.a407.sniffythedog.application.port.out.report;

import com.a407.sniffythedog.domain.report.entity.Report;
import com.a407.sniffythedog.domain.user.vo.UserId;

import java.util.Optional;

public interface ReportPort {

    Report save(Report report);

    Optional<Report> findByReporterIdAndReportedUserId(UserId reporterId, UserId reportedUserId);

    boolean existsByReporterIdAndReportedUserId(UserId reporterId, UserId reportedUserId);
}
