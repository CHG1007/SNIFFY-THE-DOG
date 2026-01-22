package com.a407.sniffythedog.adapter.in.http.common.response;

import com.a407.sniffythedog.application.common.PageInfo;

public record PageMeta(
    int number,
    int size,
    long totalElements,
    int totalPages,
    boolean hasNext,
    boolean hasPrevious
) {
    public static PageMeta from(PageInfo pageInfo) {
        return new PageMeta(
            pageInfo.page(),
            pageInfo.size(),
            pageInfo.totalElements(),
            pageInfo.totalPages(),
            pageInfo.hasNext(),
            pageInfo.hasPrevious()
        );
    }
}
