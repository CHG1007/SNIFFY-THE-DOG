package com.a407.sniffythedog.adapter.in.http.controller;

import com.a407.sniffythedog.adapter.in.http.common.response.ApiResponse;
import com.a407.sniffythedog.adapter.in.http.dto.request.CreateReportRequest;
import com.a407.sniffythedog.adapter.in.http.dto.response.CreateReportResponse;
import com.a407.sniffythedog.application.port.in.report.CreateReportCommand;
import com.a407.sniffythedog.application.port.in.report.CreateReportResult;
import com.a407.sniffythedog.application.port.in.report.CreateReportUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final CreateReportUseCase createReportUseCase;

    public ReportController(CreateReportUseCase createReportUseCase) {
        this.createReportUseCase = createReportUseCase;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateReportResponse>> createReport(
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

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(response));
    }
}
