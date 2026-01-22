package com.a407.sniffythedog.adapter.in.http.common.response;

import com.a407.sniffythedog.application.common.PageInfo;

import java.util.List;

public record PageResponse<T>(
    List<T> content,
    PageMeta page
) {
    public static <T> PageResponse<T> of(List<T> content, PageInfo pageInfo) {
        return new PageResponse<>(content, PageMeta.from(pageInfo));
    }
}
