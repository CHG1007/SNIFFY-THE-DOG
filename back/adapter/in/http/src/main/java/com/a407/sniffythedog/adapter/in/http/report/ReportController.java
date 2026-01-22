package com.a407.sniffythedog.adapter.in.http.report;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.common.response.PageResponse;
import com.a407.sniffythedog.adapter.in.http.report.request.CreateReportRequest;
import com.a407.sniffythedog.adapter.in.http.report.response.CreateReportResponse;
import com.a407.sniffythedog.adapter.in.http.report.request.GetReportListRequest;
import com.a407.sniffythedog.adapter.in.http.report.response.ReportListItemResponse;
import com.a407.sniffythedog.application.report.in.CreateReportCommand;
import com.a407.sniffythedog.application.report.in.CreateReportResult;
import com.a407.sniffythedog.application.report.in.CreateReportUseCase;
import com.a407.sniffythedog.application.report.in.GetReportListResult;
import com.a407.sniffythedog.application.report.in.GetReportListUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReportController {

    private final CreateReportUseCase createReportUseCase;
    private final GetReportListUseCase getReportListUseCase;

    @PostMapping("/api/reports")
    public ApiResponse<CreateReportResponse> createReport(
        @Valid @RequestBody CreateReportRequest request
        // TODO: @AuthenticationPrincipal 로 현재 로그인 사용자 ID 주입
    ) {
        // TODO: 실제 로그인 사용자 ID로 교체 필요
        Long reporterId = 1L;

        CreateReportCommand command = new CreateReportCommand(
            reporterId,
            request.reportedUserId(),
            request.reason()
        );

        CreateReportResult result = createReportUseCase.execute(command);

        CreateReportResponse response = new CreateReportResponse(
            result.reportId(),
            result.createdAt()
        );

        return ApiResponse.success(response);
    }

    @GetMapping("/api/admin/reports")
    public ApiResponse<PageResponse<ReportListItemResponse>> getReportList(
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false) Integer size,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String sortDirection
    ) {
        GetReportListRequest request = new GetReportListRequest(
            page, size, status, sortBy, sortDirection
        );

        GetReportListResult result = getReportListUseCase.execute(request.toQuery());

        List<ReportListItemResponse> items = result.reports().stream()
            .map(ReportListItemResponse::from)
            .toList();

        PageResponse<ReportListItemResponse> pageResponse = PageResponse.of(items, result.pageInfo());

        return ApiResponse.success(pageResponse);
    }
}
