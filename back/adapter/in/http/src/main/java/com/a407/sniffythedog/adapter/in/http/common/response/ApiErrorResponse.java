package com.a407.sniffythedog.adapter.in.http.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * API 에러 응답
 */
@Getter
@AllArgsConstructor
public class ApiErrorResponse {

    private final String code;
    private final String message;
}
