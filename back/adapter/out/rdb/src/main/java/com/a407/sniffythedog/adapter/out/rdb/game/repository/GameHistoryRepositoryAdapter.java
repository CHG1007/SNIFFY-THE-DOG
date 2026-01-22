package com.a407.sniffythedog.adapter.out.rdb.game.repository;

import com.a407.sniffythedog.adapter.out.rdb.game.entity.ParticipantEntity;
import com.a407.sniffythedog.adapter.out.rdb.game.mapper.GameHistoryMapper;
import com.a407.sniffythedog.adapter.out.rdb.game.mapper.ParticipantMapper;
import com.a407.sniffythedog.application.user.out.GameHistoryPage;
import com.a407.sniffythedog.application.user.out.GameHistoryPort;
import com.a407.sniffythedog.domain.game.entity.GameHistory;
import com.a407.sniffythedog.domain.game.entity.Participant;
import com.a407.sniffythedog.domain.user.vo.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class GameHistoryRepositoryAdapter implements GameHistoryPort {

    private final ParticipantJpaRepository participantJpaRepository;

    @Override
    public GameHistoryPage findByUserId(UserId userId, int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection)
            ? Sort.Direction.ASC
            : Sort.Direction.DESC;

        String sortField = mapSortField(sortBy);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<ParticipantEntity> entityPage = participantJpaRepository.findByUserIdWithGameHistory(
            userId.value(),
            pageable
        );

        List<GameHistoryPage.GameHistoryWithParticipant> content = entityPage.getContent().stream()
            .map(entity -> {
                GameHistory gameHistory = GameHistoryMapper.toDomain(entity.getGameHistory());
                Participant participant = ParticipantMapper.toDomain(entity);
                return new GameHistoryPage.GameHistoryWithParticipant(gameHistory, participant);
            })
            .toList();

        return new GameHistoryPage(
            content,
            entityPage.getNumber(),
            entityPage.getSize(),
            entityPage.getTotalElements(),
            entityPage.getTotalPages()
        );
    }

    private String mapSortField(String sortBy) {
        return switch (sortBy) {
            case "startAt" -> "gameHistory.startAt";
            case "endAt" -> "gameHistory.endAt";
            case "playTime" -> "gameHistory.playTime";
            default -> "gameHistory.startAt";
        };
    }
}
