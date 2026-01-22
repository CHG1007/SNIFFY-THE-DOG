package com.a407.sniffythedog.application.common;

public record PageInfo(
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean hasNext,
    boolean hasPrevious
) {
    public static PageInfo of(int page, int size, long totalElements, int totalPages) {
        return new PageInfo(
            page,
            size,
            totalElements,
            totalPages,
            page < totalPages - 1,
            page > 0
        );
    }
}
