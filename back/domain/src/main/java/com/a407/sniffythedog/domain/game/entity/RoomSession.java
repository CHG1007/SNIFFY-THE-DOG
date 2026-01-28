package com.a407.sniffythedog.domain.game.entity;

import com.a407.sniffythedog.domain.game.enums.*;
import com.a407.sniffythedog.domain.game.exception.GameDomainException;
import com.a407.sniffythedog.domain.game.vo.*;

import java.time.Instant;
import java.util.*;


public class RoomSession {

    private static final int MIN_CAPACITY = 6;
    private static final int MAX_CAPACITY = 8;

    private final RoomId id;
    private RoomTitle title;
    private PrivateGame privateGame;
    private int capacity;
    private GameUserId hostUserId;
    private RoomStatus status;
    private long version;
    private final Instant createdAt;
    private Instant updatedAt;
    private Instant startedAt;
    private Instant endedAt;
    private final Map<GameUserId, PlayerState> players;
    private GameState gameState;

    private RoomSession(RoomId id, RoomTitle title, PrivateGame privateGame, int capacity,
                        GameUserId hostUserId, RoomStatus status, long version,
                        Instant createdAt, Instant updatedAt, Instant startedAt, Instant endedAt,
                        Map<GameUserId, PlayerState> players, GameState gameState) {
        this.id = id;
        this.title = Objects.requireNonNull(title);
        this.privateGame = privateGame;
        this.capacity = validateCapacity(capacity);
        this.hostUserId = Objects.requireNonNull(hostUserId);
        this.status = Objects.requireNonNull(status);
        this.version = version;
        this.createdAt = Objects.requireNonNull(createdAt);
        this.updatedAt = Objects.requireNonNull(updatedAt);
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.players = new HashMap<>(players);
        this.gameState = Objects.requireNonNull(gameState);
    }

    public static RoomSession create(RoomId id, RoomTitle title, boolean isPrivate, int capacity,
                                     GameUserId hostUserId, String hostDisplayName) {
        Instant now = Instant.now();
        Map<GameUserId, PlayerState> players = new HashMap<>();
        PlayerState host = PlayerState.createNew(hostUserId, hostDisplayName, true);
        players.put(hostUserId, host);

        PrivateGame gameSetting = isPrivate ? PrivateGame.closed() : PrivateGame.open();

        return new RoomSession(id, title, gameSetting, capacity, hostUserId, RoomStatus.WAITING,
                0, now, now, null, null, players, GameState.initial());
    }

    public static RoomSession reconstitute(RoomId id, RoomTitle title, boolean isPrivate, String inviteCode,
                                           int capacity, GameUserId hostUserId, RoomStatus status, long version,
                                           Instant createdAt, Instant updatedAt, Instant startedAt, Instant endedAt,
                                           Map<GameUserId, PlayerState> players, GameState gameState) {
        PrivateGame gameSetting = PrivateGame.of(isPrivate, inviteCode);

        return new RoomSession(id, title, gameSetting, capacity, hostUserId, status, version,
                createdAt, updatedAt, startedAt, endedAt, players, gameState);
    }

    private static int validateCapacity(int capacity) {
        if (capacity < MIN_CAPACITY || capacity > MAX_CAPACITY) {
            throw new GameDomainException(
                    String.format("인원은 %d명에서 %d명 사이여야 합니다", MIN_CAPACITY, MAX_CAPACITY));
        }
        return capacity;
    }

    // Player Management
    public void joinPlayer(GameUserId userId, String displayName) {
        if (status != RoomStatus.WAITING) {
            throw new GameDomainException("대기 중인 방에만 입장할 수 있습니다");
        }
        if (players.size() >= capacity) {
            throw new GameDomainException("방이 가득 찼습니다");
        }
        if (players.containsKey(userId)) {
            throw new GameDomainException("이미 방에 참가 중입니다");
        }
        players.put(userId, PlayerState.createNew(userId, displayName, false));
        touch();
    }

    public void leavePlayer(GameUserId userId) {
        if (!players.containsKey(userId)) {
            throw new GameDomainException("방에 참가 중이 아닙니다");
        }
        players.remove(userId);
        touch();

        // 방장이 나가면 다른 사람에게 위임
        if (hostUserId.equals(userId) && !players.isEmpty()) {
            GameUserId newHost = players.keySet().iterator().next();
            transferHost(newHost);
        }
    }

    public void transferHost(GameUserId newHostId) {
        if (!players.containsKey(newHostId)) {
            throw new GameDomainException("방에 있는 플레이어에게만 방장을 위임할 수 있습니다");
        }
        this.hostUserId = newHostId;
        touch();
    }

    public void togglePlayerReady(GameUserId userId) {
        PlayerState player = players.get(userId);
        if (player == null) {
            throw new GameDomainException("방에 참가 중이 아닙니다");
        }
        player.toggleReady();
        touch();
    }

    public boolean canStart() {
        if (players.size() < MIN_CAPACITY) return false;
        return players.values().stream().allMatch(PlayerState::isReady);
    }

    // Game Flow
    public void startGame(PhaseTiming timing) {
        if (!canStart()) {
            throw new GameDomainException("게임을 시작할 수 없습니다 - 모든 플레이어가 준비되지 않았거나 인원이 부족합니다");
        }
        this.status = RoomStatus.PLAYING;
        this.startedAt = Instant.now();
        assignRoles();
        this.gameState = new GameState(
                1,
                Phase.DAY,
                Instant.now().plusSeconds(timing.daySec()),
                VoteState.empty(),
                TrialState.empty(),
                NightState.empty()
        );
        touch();
    }

    public void proceedToNextPhase(PhaseTiming timing) {
        if (this.status != RoomStatus.PLAYING) return;

        Phase currentPhase = gameState.phase();
        Instant now = Instant.now();

        switch (currentPhase) {
            // 1. 낮(DAY) -> 투표(DAY_VOTE)
            case DAY:
                this.gameState = gameState
                        .toPhase(Phase.DAY_VOTE, now.plusSeconds(timing.dayVoteSec()))
                        .withDayVote(VoteState.empty());
                break;

            // 2. 투표(DAY_VOTE) -> 밤(NIGHT)
            case DAY_VOTE:
                this.gameState = gameState
                        .toPhase(Phase.NIGHT, now.plusSeconds(timing.nightSec()))
                        .withNight(NightState.empty());
                break;

            // 3. 최후변론(DEFENSE) -> 찬반투표(FINAL_VOTE)
            case DEFENSE:
                this.gameState = gameState
                        .toPhase(Phase.FINAL_VOTE, now.plusSeconds(timing.finalVoteSec()));
                break;

            // 4. 찬반투표(FINAL_VOTE) -> 밤(NIGHT)
            case FINAL_VOTE:
                concludeTrial(); // 재판 종료 처리
                this.gameState = gameState
                        .toPhase(Phase.NIGHT, now.plusSeconds(timing.nightSec()))
                        .withNight(NightState.empty());
                break;

            // 5. 밤(NIGHT) -> 다음 날 낮(DAY) [라운드 변경]
            case NIGHT:
                // 라운드 증가 + 모든 상태 초기화 + DAY로 시작
                this.gameState = gameState.toNextRound(now.plusSeconds(timing.daySec()));
                break;

            default:
                // 예외 발생 시 안전하게 다음 날로 이동
                this.gameState = gameState.toNextRound(now.plusSeconds(timing.daySec()));
        }

        touch();
    }

    private void assignRoles() {
        List<GameUserId> playerIds = new ArrayList<>(players.keySet());
        Collections.shuffle(playerIds);

        int playerCount = playerIds.size();
        // 인원별 직업 분배: 마피아 2, 의사 1, 경찰 1, 나머지 시민
        int mafiaCount = 2;
        int doctorCount = 1;
        int policeCount = 1;
        int citizenCount = playerCount - mafiaCount - doctorCount - policeCount;

        int index = 0;
        for (int i = 0; i < mafiaCount && index < playerCount; i++, index++) {
            players.get(playerIds.get(index)).assignRole(GameRole.MAFIA);
        }
        for (int i = 0; i < doctorCount && index < playerCount; i++, index++) {
            players.get(playerIds.get(index)).assignRole(GameRole.DOCTOR);
        }
        for (int i = 0; i < policeCount && index < playerCount; i++, index++) {
            players.get(playerIds.get(index)).assignRole(GameRole.POLICE);
        }
        for (int i = 0; i < citizenCount && index < playerCount; i++, index++) {
            players.get(playerIds.get(index)).assignRole(GameRole.CITIZEN);
        }
    }

    public void transitionToPhase(Phase newPhase, Instant phaseEndsAt) {
        this.gameState = gameState.toPhase(newPhase, phaseEndsAt);
        touch();
    }

    public void nextRound(Instant phaseEndsAt) {
        this.gameState = gameState.toNextRound(phaseEndsAt);
        touch();
    }

    public void endGame() {
        this.status = RoomStatus.ENDED;
        this.endedAt = Instant.now();
        touch();
    }

    // Vote
    public void castDayVote(GameUserId voter, GameUserId target) {
        VoteState newVote = gameState.dayVote().vote(voter, target);
        this.gameState = gameState.withDayVote(newVote);
        touch();
    }

    public void setAccused(GameUserId accusedId) {
        this.gameState = gameState.withTrial(TrialState.withAccused(accusedId));
        touch();
    }

    public void castFinalVote(GameUserId voter, YesNo vote) {
        TrialState newTrial = gameState.trial().vote(voter, vote);
        this.gameState = gameState.withTrial(newTrial);
        touch();
    }

    public void concludeTrial() {
        TrialState concludedTrial = gameState.trial().conclude();
        this.gameState = gameState.withTrial(concludedTrial);
        touch();
    }

    // Night Actions
    public void setMafiaTarget(GameUserId target) {
        NightState newNight = gameState.night().withMafiaTarget(target);
        this.gameState = gameState.withNight(newNight);
        touch();
    }

    public void setPoliceTarget(GameUserId target) {
        NightState newNight = gameState.night().withPoliceTarget(target);
        this.gameState = gameState.withNight(newNight);
        touch();
    }

    public void setDoctorTarget(GameUserId target) {
        NightState newNight = gameState.night().withDoctorTarget(target);
        this.gameState = gameState.withNight(newNight);
        touch();
    }

    public void killPlayer(GameUserId userId) {
        PlayerState player = players.get(userId);
        if (player != null) {
            player.kill();
            touch();
        }
    }

    // Win Condition Check
    public boolean isMafiaWin() {
        long aliveMafia = players.values().stream()
                .filter(PlayerState::isAlive)
                .filter(PlayerState::isMafia)
                .count();
        long aliveCitizen = players.values().stream()
                .filter(PlayerState::isAlive)
                .filter(PlayerState::isCitizenTeam)
                .count();
        return aliveMafia >= aliveCitizen;
    }

    public boolean isCitizenWin() {
        return players.values().stream()
                .filter(PlayerState::isAlive)
                .noneMatch(PlayerState::isMafia);
    }

    // 게임 판정
    public boolean isGameOver() {
        return isMafiaWin() || isCitizenWin();
    }

    // 커밋 반영을 위해서 게임 오버 쳌크
    // Optional<Winner>로 반환값을 둬서 게임이 끝나지 않았을떄는 empty , 끝나면 winner 반환
    public Optional<Winner> checkAndEndIfGameOver() {
        if (this.status == RoomStatus.ENDED) return Optional.empty();
        if (!isGameOver()) return Optional.empty();

        Winner winner = isCitizenWin() ? Winner.CITIZEN : Winner.MAFIA;
        endGame(); // status=ENDED, endedAt, touch()
        return Optional.of(winner);
    }

    private void touch() {
        this.updatedAt = Instant.now();
        this.version++;
    }

    // Getters
    public RoomId getId() {
        return id;
    }

    public RoomTitle getTitle() {
        return title;
    }

    public PrivateGame getPrivateGame(){return privateGame;}

    public boolean isPrivate() {
        return privateGame.isPrivate();
    }

    public String getInviteCode() {return privateGame.inviteCode();}

    public int getCapacity() {
        return capacity;
    }

    public GameUserId getHostUserId() {
        return hostUserId;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public long getVersion() {
        return version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public Map<GameUserId, PlayerState> getPlayers() {
        return Collections.unmodifiableMap(players);
    }

    public PlayerState getPlayer(GameUserId userId) {
        return players.get(userId);
    }

    public GameState getGameState() {
        return gameState;
    }

    public int getPlayerCount() {
        return players.size();
    }
}
