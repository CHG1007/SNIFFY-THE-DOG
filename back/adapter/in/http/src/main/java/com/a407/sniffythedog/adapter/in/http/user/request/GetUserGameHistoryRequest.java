package com.a407.sniffythedog.adapter.in.http.user.request;

import com.a407.sniffythedog.application.user.in.GetUserGameHistoryQuery;

public record GetUserGameHistoryRequest(
    Integer page,
    Integer size,
    String sortBy,
    String sortDirection
) {
    public GetUserGameHistoryQuery toQuery(Long userId) {
        return GetUserGameHistoryQuery.of(
            userId,
            page != null ? page : 0,
            size != null ? size : 20,
            sortBy,
            sortDirection
        );
    }
}
