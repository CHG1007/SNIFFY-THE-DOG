package com.a407.sniffythedog.application.vote;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.gamelog.out.GameLogRedisPort;
import com.a407.sniffythedog.application.room.out.RedisRoomPort;
import com.a407.sniffythedog.application.vote.in.CastVote1Command;
import com.a407.sniffythedog.application.vote.in.CastVote1UseCase;
import com.a407.sniffythedog.application.vote.out.RoomEventPort;
import com.a407.sniffythedog.domain.game.entity.PlayerState;
import com.a407.sniffythedog.domain.game.entity.RoomSession;
import com.a407.sniffythedog.domain.game.enums.Phase;
import com.a407.sniffythedog.domain.game.enums.RoomStatus;
import com.a407.sniffythedog.domain.game.vo.GameUserId;
import com.a407.sniffythedog.domain.game.vo.RoomId;
import com.a407.sniffythedog.domain.game.vo.VoteState;
import com.a407.sniffythedog.domain.gamelog.vo.GameEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CastVote1Service implements CastVote1UseCase {

    private final RedisRoomPort redisRoomPort; // 방 상태 저장
    private final RoomEventPort roomEventPort; // 투표 여부를 알리는 포트
    private final GameLogRedisPort gameLogRedisPort;

    @Override
    public void execute(CastVote1Command command) {
        RoomId roomId = RoomId.of(command.roomCode()); // 방
        GameUserId voterId = GameUserId.of(command.voterUserId()); // 누가 투표함 ?
        GameUserId targetId = GameUserId.of(command.targetUserId()); // 누구 지목 ?

        // 집계결과는 updateRoomAtomically 안에서 계산 -> 결과 브로드 캐스트는 updateRoomAtomically 밖에서 해야 안정적
        // 왜냐면 저장 성공한 후에만 방송해야하니까 ... -> 따라 서 박스 필요함
        final Holder vote1ResultHolder = new Holder();

        RoomSession updated = redisRoomPort.updateRoomAtomically(roomId, room -> {

            // 1.  상태 체크
            if (room.getStatus() != RoomStatus.PLAYING) {
                throw ApplicationException.of(ExceptionType.ROOM_NOT_JOINABLE);
            }
            if (room.getGameState().phase() != Phase.VOTE_1) {
                throw ApplicationException.of(ExceptionType.INVALID_PHASE);
            }

            // 2. voter/target 존재 + 생존
            Map<GameUserId, PlayerState> players = room.getPlayers();
            PlayerState voter = players.get(voterId);
            PlayerState target = players.get(targetId);

            if (voter == null || !voter.isAlive()) throw ApplicationException.of(ExceptionType.NOT_ALLOWED);
            if (target == null || !target.isAlive()) throw ApplicationException.of(ExceptionType.NOT_ALLOWED);

            // 3. 중복 투표 방지
            VoteState voteState = room.getGameState().dayVote();
            if (voteState.getVote(voterId).isPresent()) {
                throw ApplicationException.of(ExceptionType.ALREADY_VOTED);
            }

            // 4. 투표 반영 하기 호호,, 코드 안에 메서드로 (touch()로 version++ 자동)
            room.castDayVote(voterId, targetId);

            vote1ResultHolder.round = room.getGameState().round(); 

            // 5. 전원 투표 완료면 집계해서 accused 설정
            long aliveCount = room.getPlayers().values().stream().filter(PlayerState::isAlive).count(); // 투표해야하는 사람 수
            int totalVotes = room.getGameState().dayVote().getTotalVotes(); // 이미 투표한 사람 수

            if (totalVotes == (int) aliveCount) { // 이제 투표해야하는 사람 = 살아있는 사람
                VoteState latest = room.getGameState().dayVote();
                Map<GameUserId, Long> counts = latest.countVotes();

                long max = counts.values().stream().max(Long::compare).orElse(0L);
                List<GameUserId> top = counts.entrySet().stream()
                        .filter(e -> e.getValue() == max)
                        .map(Map.Entry::getKey)
                        .toList();


                // 단독 1등
                if (top.size() == 1) {
                    room.setAccused(top.get(0));
                    vote1ResultHolder.accusedUserId = top.get(0).value();
                    vote1ResultHolder.isTie = false; // 동점아니니까 False
                } else {
                    // 동점
                    vote1ResultHolder.accusedUserId = null;
                    vote1ResultHolder.isTie = true;
                }
            }
            return room;
        });

        // 누구 투표했는지 업데이트는 항상 브로드캐스트
        roomEventPort.publishVote1Update(command.roomCode(), updated.getVersion(), command.voterUserId(), true);

        // VOTE1_RESULT는 PhaseEndService에서 페이즈 종료 시 발행 (중복 방지)

        gameLogRedisPort.saveEvent(command.roomCode(),
                GameEvent.vote1Cast(vote1ResultHolder.round, command.voterUserId(), command.targetUserId())
        );

        if (vote1ResultHolder.resolved()) {
            gameLogRedisPort.saveEvent(command.roomCode(),
                    GameEvent.vote1Result(vote1ResultHolder.round, vote1ResultHolder.accusedUserId, vote1ResultHolder.isTie)
            );
        }

    }

    // updateRoomAtomically 내부에서 계산된 결과를 바깥으로 들고 나오기 위한 간단 홀더
    private static class Holder {
        int round = 1; //todo: round 1로 해놔서 이거 바꿔야함

        Long accusedUserId = null;

        boolean isTie = false;

        boolean resolved()
         { return isTie || accusedUserId != null; }
    }
}
