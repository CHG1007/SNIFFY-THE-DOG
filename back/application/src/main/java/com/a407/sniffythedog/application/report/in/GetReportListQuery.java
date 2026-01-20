package com.a407.sniffythedog.application.report.in;

public record GetReportListQuery(
    int page,
    int size,
    String status,
    String sortBy,
    String sortDirection
) {
    public GetReportListQuery {
        if (page < 0) {
            page = 0;
        }
        if (size <= 0 || size > 100) {
            size = 20;
        }
        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "createdAt";
        }
        if (sortDirection == null || sortDirection.isBlank()) {
            sortDirection = "DESC";
        }
    }

    public static GetReportListQuery of(int page, int size, String status,
                                        String sortBy, String sortDirection) {
        return new GetReportListQuery(page, size, status, sortBy, sortDirection);
    }
}
