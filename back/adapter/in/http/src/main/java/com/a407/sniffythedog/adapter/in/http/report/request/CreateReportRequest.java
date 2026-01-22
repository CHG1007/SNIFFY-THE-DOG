package com.a407.sniffythedog.adapter.in.http.report.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReportRequest(
    @NotNull(message = "피신고자 ID는 필수입니다")
    Long reportedUserId,

    @NotBlank(message = "신고 사유는 필수입니다")
    @Size(min = 1, max = 500, message = "신고 사유는 1~500자 이내여야 합니다")
    String reason
) {
}
