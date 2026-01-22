package com.a407.sniffythedog.adapter.out.rdb.report.repository;

import com.a407.sniffythedog.adapter.out.rdb.report.entity.ReportEntity;
import com.a407.sniffythedog.adapter.out.rdb.report.mapper.ReportMapper;
import com.a407.sniffythedog.application.report.out.ReportPage;
import com.a407.sniffythedog.application.report.out.ReportPort;
import com.a407.sniffythedog.domain.report.entity.Report;
import com.a407.sniffythedog.domain.report.enums.ReportStatus;
import com.a407.sniffythedog.domain.user.vo.UserId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ReportRepositoryAdapter implements ReportPort {

    private final ReportJpaRepository reportJpaRepository;

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

    @Override
    public ReportPage findAll(int page, int size, ReportStatus status, String sortBy, String sortDirection) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection)
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<ReportEntity> entityPage;
        if (status != null) {
            entityPage = reportJpaRepository.findByStatus(status, pageable);
        } else {
            entityPage = reportJpaRepository.findAll(pageable);
        }

        List<Report> reports = entityPage.getContent().stream()
            .map(ReportMapper::toDomain)
            .toList();

        return new ReportPage(
            reports,
            entityPage.getNumber(),
            entityPage.getSize(),
            entityPage.getTotalElements(),
            entityPage.getTotalPages()
        );
    }
}
