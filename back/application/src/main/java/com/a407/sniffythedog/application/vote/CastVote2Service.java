package com.a407.sniffythedog.application.vote;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.gamelog.GameResultService;
import com.a407.sniffythedog.application.gamelog.out.GameLogRedisPort;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.application.vote.in.CastVote2Command;
import com.a407.sniffythedog.application.vote.in.CastVote2UseCase;
import com.a407.sniffythedog.application.vote.out.RoomEventPort;
import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.enums.FinalVoteResult;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.enums.RoomStatus;
import com.a407.sniffythedog.domain.game.enums.Winner;
import com.a407.sniffythedog.domain.game.enums.YesNo;
import com.a407.sniffythedog.domain.game.vo.FinalVoteState;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import com.a407.sniffythedog.domain.game.vo.TrialState;
import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CastVote2Service implements CastVote2UseCase {

    private final RedisRoomPort redisRoomPort;
    private final RoomEventPort roomEventPort;
    private final GameLogRedisPort gameLogRedisPort;
    private final GameResultService gameResultService;

    @Override
    public void execute(CastVote2Command command) {

        RoomId roomId = RoomId.of(command.roomCode());
        GameUserId voterId = GameUserId.of(command.voterUserId());
        YesNo vote = command.vote();

        final ResultHolder holder = new ResultHolder();

        RoomSession updated = redisRoomPort.updateRoomAtomically(roomId, room -> {

            // 방상태가 PLAYING 중인지
            if (room.getStatus() != RoomStatus.PLAYING) {
                throw ApplicationException.of(ExceptionType.ROOM_NOT_JOINABLE);
            }

            // VOTE_2 phase인지 확인
            if (room.getGameState().phase() != Phase.VOTE_2) {
                throw ApplicationException.of(ExceptionType.INVALID_PHASE);
            }

            // 재판단계인지
            TrialState trial = room.getGameState().trial();
            if (!trial.hasAccused()) {
                throw ApplicationException.of(ExceptionType.INVALID_PHASE);
            }

            // 방에 없는 유저거나 죽은 유저면 투표 못하게 처리
            PlayerState voter = room.getPlayers().get(voterId);
            if (voter == null || !voter.isAlive()) {
                throw ApplicationException.of(ExceptionType.NOT_ALLOWED);
            }

            // 중복 투표 방지
            if (trial.finalVote().getVote(voterId).isPresent()) {
                throw ApplicationException.of(ExceptionType.ALREADY_VOTED);
            }

            // 투표 반영
            room.castFinalVote(voterId, vote);

            //todo: round 일단 1로 저장함
            holder.round = 1;

            // 살아있는 사람의 수
            long aliveCount = room.getPlayers().values()
                    .stream().filter(PlayerState::isAlive).count();
            // 지금까지 들어온 투표수
            int totalVotes = room.getGameState().trial()
                    .finalVote().votes().size();

            if (totalVotes == aliveCount) {

                holder.resolved = true;
                // 판결 확정
                room.concludeTrial();

                FinalVoteState finalVote = room.getGameState().trial().finalVote();
                GameUserId accused = room.getGameState().trial().accusedUserId();

                holder.approved = finalVote.result() == FinalVoteResult.EXECUTE;
                holder.yes = finalVote.getYesCount();
                holder.no = finalVote.getNoCount();
                holder.executedUserId = accused == null ? null : accused.value();

                // 처형 대상이 마피아인지 확인
                if (accused != null) {
                    PlayerState accusedPlayer = room.getPlayers().get(accused);
                    holder.executedIsMafia = (accusedPlayer != null && accusedPlayer.isMafia());
                }

                // 처형
                if (holder.approved && accused != null) {
                    room.killPlayer(accused);
                    holder.killed = true;

                    room.checkAndEndIfGameOver().ifPresent(winner -> {
                        holder.finished = true;
                        holder.winnerTeam = winner.name();
                    });
                }
            }

            return room;
        });

        // 투표 진행 알림
        roomEventPort.publishVote2Update(
                command.roomCode(),
                updated.getVersion(),
                command.voterUserId(),
                true
        );

        boolean yes = (vote == YesNo.YES);
        gameLogRedisPort.saveEvent(
                command.roomCode(),
                GameEvent.vote2Cast(holder.round, command.voterUserId(),yes)
        );

        // 판결 결과 알림
        if (holder.resolved()) {

            roomEventPort.publishVote2Result(
                    command.roomCode(),
                    updated.getVersion(),
                    holder.approved,
                    holder.executedUserId,
                    holder.yes,
                    holder.no
            );

            gameLogRedisPort.saveEvent(
                    command.roomCode(),
                    GameEvent.vote2Result(holder.round, holder.approved, holder.executedUserId, holder.executedIsMafia,
                            holder.yes, holder.no)
            );

            if (holder.killed) {
                roomEventPort.publishPlayerStatusChanged(
                        command.roomCode(),
                        updated.getVersion(),
                        holder.executedUserId,
                        false,
                        "VOTE_EXECUTION"
                );
            }

            if (holder.finished) {
                gameLogRedisPort.saveEvent(
                        command.roomCode(),
                        GameEvent.gameFinished(holder.round, holder.winnerTeam)
                );

                List<RoomEventPort.PlayerRoleInfo> playerRoles = updated.getPlayers().entrySet().stream()
                        .map(e -> new RoomEventPort.PlayerRoleInfo(
                                e.getKey().value(),
                                e.getValue().getDisplayName(),
                                e.getValue().getGameRole() != null ? e.getValue().getGameRole().name() : "CITIZEN"
                        ))
                        .collect(Collectors.toList());

                roomEventPort.publishGameFinished(
                        command.roomCode(),
                        updated.getVersion(),
                        holder.winnerTeam,
                        null,
                        playerRoles
                );

                gameResultService.processGameResult(
                        command.roomCode(),
                        Winner.valueOf(holder.winnerTeam),
                        updated.getStartedAt(),
                        updated.getEndedAt() != null ? updated.getEndedAt() : Instant.now()
                );
            }
        }
    }

    private static class ResultHolder {
        int round = 1;

        boolean resolved = false;

        boolean approved;
        long yes;
        long no;

        Long executedUserId;
        Boolean executedIsMafia;

        boolean killed;
        boolean finished;
        String winnerTeam;

        boolean resolved() { return resolved; }

    }
}
