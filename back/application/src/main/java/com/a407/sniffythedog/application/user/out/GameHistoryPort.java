package com.a407.sniffythedog.application.user.out;

import com.a407.sniffythedog.domain.user.vo.UserId;

public interface GameHistoryPort {
    GameHistoryPage findByUserId(UserId userId, int page, int size, String sortBy, String sortDirection);
}