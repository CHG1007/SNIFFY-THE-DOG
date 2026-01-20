package com.a407.sniffythedog.adapter.in.http.report.request;

import com.a407.sniffythedog.application.report.in.GetReportListQuery;

public record GetReportListRequest(
    Integer page,
    Integer size,
    String status,
    String sortBy,
    String sortDirection
) {
    public GetReportListQuery toQuery() {
        return GetReportListQuery.of(
            page != null ? page : 0,
            size != null ? size : 20,
            status,
            sortBy,
            sortDirection
        );
    }
}
