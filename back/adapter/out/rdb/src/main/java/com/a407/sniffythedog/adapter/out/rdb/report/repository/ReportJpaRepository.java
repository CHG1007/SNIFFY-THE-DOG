package com.a407.sniffythedog.adapter.out.rdb.report.repository;

import com.a407.sniffythedog.adapter.out.rdb.report.entity.ReportEntity;
import com.a407.sniffythedog.domain.report.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReportJpaRepository extends JpaRepository<ReportEntity, Long> {

    Optional<ReportEntity> findByReporterIdAndReportedUserId(Long reporterId, Long reportedUserId);

    boolean existsByReporterIdAndReportedUserId(Long reporterId, Long reportedUserId);

    Page<ReportEntity> findByStatus(ReportStatus status, Pageable pageable);
}
