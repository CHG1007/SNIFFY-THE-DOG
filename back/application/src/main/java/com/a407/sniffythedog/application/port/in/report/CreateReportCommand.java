package com.a407.sniffythedog.application.port.in.report;

import com.a407.sniffythedog.application.exception.ApplicationException;
import com.a407.sniffythedog.application.exception.ExceptionType;

public record CreateReportCommand(
    Long reporterId,
    Long reportedUserId,
    String reason
) {
    public CreateReportCommand {
        if (reporterId == null) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "신고자 ID는 필수입니다");
        }
        if (reportedUserId == null) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "피신고자 ID는 필수입니다");
        }
        if (reason == null || reason.isBlank()) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "신고 사유는 필수입니다");
        }
    }
}
