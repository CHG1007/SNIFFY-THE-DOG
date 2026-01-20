package com.a407.sniffythedog.adapter.out.rdb.game.entity;

import com.a407.sniffythedog.domain.game.enums.GameResult;
import com.a407.sniffythedog.domain.game.enums.GameRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "participants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ParticipantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private GameHistoryEntity gameHistory;

    @Enumerated(EnumType.STRING)
    @Column(name = "job", nullable = false)
    private GameRole job;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false)
    private GameResult result;

    @Column(name = "is_alive", nullable = false)
    private boolean isAlive;
}
