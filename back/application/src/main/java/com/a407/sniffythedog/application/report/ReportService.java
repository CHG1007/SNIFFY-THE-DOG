package com.a407.sniffythedog.application.report;

import com.a407.sniffythedog.application.common.PageInfo;
import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.report.in.CreateReportCommand;
import com.a407.sniffythedog.application.report.in.CreateReportResult;
import com.a407.sniffythedog.application.report.in.CreateReportUseCase;
import com.a407.sniffythedog.application.report.in.GetReportListQuery;
import com.a407.sniffythedog.application.report.in.GetReportListResult;
import com.a407.sniffythedog.application.report.in.GetReportListUseCase;
import com.a407.sniffythedog.application.report.out.ReportPage;
import com.a407.sniffythedog.application.report.out.ReportPort;
import com.a407.sniffythedog.application.user.out.UserPort;
import com.a407.sniffythedog.domain.report.entity.Report;
import com.a407.sniffythedog.domain.report.enums.ReportStatus;
import com.a407.sniffythedog.domain.report.vo.ReportReason;
import com.a407.sniffythedog.domain.user.entity.User;
import com.a407.sniffythedog.domain.user.vo.UserId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReportService implements CreateReportUseCase, GetReportListUseCase {

    private final ReportPort reportPort;
    private final UserPort userPort;

    public ReportService(ReportPort reportPort, UserPort userPort) {
        this.reportPort = reportPort;
        this.userPort = userPort;
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

    @Override
    @Transactional(readOnly = true)
    public GetReportListResult execute(GetReportListQuery query) {
        ReportStatus status = parseStatus(query.status());

        ReportPage reportPage = reportPort.findAll(
            query.page(),
            query.size(),
            status,
            query.sortBy(),
            query.sortDirection()
        );

        Set<UserId> userIds = reportPage.content().stream()
            .flatMap(report -> java.util.stream.Stream.of(
                report.getReporterId(),
                report.getReportedUserId()
            ))
            .collect(Collectors.toSet());

        Map<UserId, User> userMap = userPort.findByIds(userIds);

        List<GetReportListResult.ReportItem> reportItems = reportPage.content().stream()
            .map(report -> {
                User reporter = userMap.get(report.getReporterId());
                User reportedUser = userMap.get(report.getReportedUserId());

                return new GetReportListResult.ReportItem(
                    report.getId().value(),
                    report.getReporterId().value(),
                    reporter != null ? reporter.getNickname().value() : null,
                    report.getReportedUserId().value(),
                    reportedUser != null ? reportedUser.getNickname().value() : null,
                    report.getReason().value(),
                    report.getStatus().name(),
                    report.getCreatedAt(),
                    report.getProcessedAt()
                );
            })
            .toList();

        PageInfo pageInfo = PageInfo.of(
            reportPage.page(),
            reportPage.size(),
            reportPage.totalElements(),
            reportPage.totalPages()
        );

        return new GetReportListResult(reportItems, pageInfo);
    }

    private ReportStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return ReportStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
