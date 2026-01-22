package com.a407.sniffythedog.application.user.in;

public record GetUserGameHistoryQuery(
    Long userId,
    int page,
    int size,
    String sortBy,
    String sortDirection
) {
    public GetUserGameHistoryQuery {
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 20;
        if (sortBy == null || sortBy.isBlank()) sortBy = "startAt";
        if (sortDirection == null || sortDirection.isBlank()) sortDirection = "DESC";
    }

    public static GetUserGameHistoryQuery of(Long userId, int page, int size, String sortBy, String sortDirection) {
        return new GetUserGameHistoryQuery(userId, page, size, sortBy, sortDirection);
    }
}