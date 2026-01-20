package com.a407.sniffythedog.application.service.report;

import com.a407.sniffythedog.application.exception.ApplicationException;
import com.a407.sniffythedog.application.exception.ExceptionType;
import com.a407.sniffythedog.application.port.in.report.CreateReportCommand;
import com.a407.sniffythedog.application.port.in.report.CreateReportResult;
import com.a407.sniffythedog.application.port.in.report.CreateReportUseCase;
import com.a407.sniffythedog.application.port.out.report.ReportPort;
import com.a407.sniffythedog.domain.report.entity.Report;
import com.a407.sniffythedog.domain.report.vo.ReportReason;
import com.a407.sniffythedog.domain.user.vo.UserId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReportService implements CreateReportUseCase {

    private final ReportPort reportPort;

    public ReportService(ReportPort reportPort) {
        this.reportPort = reportPort;
    }

    @Override
    public CreateReportResult execute(CreateReportCommand command) {
        UserId reporterId = UserId.of(command.reporterId());
        UserId reportedUserId = UserId.of(command.reportedUserId());

        if (reporterId.equals(reportedUserId)) {
            throw ApplicationException.of(ExceptionType.CANNOT_REPORT_SELF);
        }

        if (reportPort.existsByReporterIdAndReportedUserId(reporterId, reportedUserId)) {
            throw ApplicationException.of(ExceptionType.ALREADY_REPORTED);
        }

        ReportReason reason = ReportReason.of(command.reason());
        Report report = Report.create(reporterId, reportedUserId, reason);
        Report savedReport = reportPort.save(report);

        return new CreateReportResult(
            savedReport.getId().value(),
            savedReport.getCreatedAt()
        );
    }
}
