package com.a407.sniffythedog.application.report.out;

import com.a407.sniffythedog.domain.report.entity.Report;

import java.util.List;

public record ReportPage(
    List<Report> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public boolean hasNext() {
        return page < totalPages - 1;
    }

    public boolean hasPrevious() {
        return page > 0;
    }
}
