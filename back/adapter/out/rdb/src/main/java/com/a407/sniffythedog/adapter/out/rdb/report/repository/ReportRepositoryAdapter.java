package com.a407.sniffythedog.adapter.out.rdb.report.repository;

import com.a407.sniffythedog.adapter.out.rdb.report.entity.ReportEntity;
import com.a407.sniffythedog.adapter.out.rdb.report.mapper.ReportMapper;
import com.a407.sniffythedog.application.port.out.report.ReportPort;
import com.a407.sniffythedog.domain.report.entity.Report;
import com.a407.sniffythedog.domain.user.vo.UserId;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class ReportRepositoryAdapter implements ReportPort {

    private final ReportJpaRepository reportJpaRepository;

    public ReportRepositoryAdapter(ReportJpaRepository reportJpaRepository) {
        this.reportJpaRepository = reportJpaRepository;
    }

    @Override
    public Report save(Report report) {
        ReportEntity entity = ReportMapper.toEntity(report);
        ReportEntity savedEntity = reportJpaRepository.save(entity);
        return ReportMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Report> findByReporterIdAndReportedUserId(UserId reporterId, UserId reportedUserId) {
        return reportJpaRepository
            .findByReporterIdAndReportedUserId(reporterId.value(), reportedUserId.value())
            .map(ReportMapper::toDomain);
    }

    @Override
    public boolean existsByReporterIdAndReportedUserId(UserId reporterId, UserId reportedUserId) {
        return reportJpaRepository.existsByReporterIdAndReportedUserId(
            reporterId.value(),
            reportedUserId.value()
        );
    }
}
