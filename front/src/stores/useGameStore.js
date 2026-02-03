import { create } from 'zustand';

/**
 * 게임 상태 관리 스토어
 * ws명세.md 및 mafia_game_front_logic.md 기반
 */
const useGameStore = create((set, get) => ({
  // === 방/세션 정보 ===
  roomCode: null,
  version: 0,

  // === 플레이어 정보 ===
  players: [],

  // === 내 정보 (개인 채널로 수신) ===
  myInfo: {
    userId: null,
    nickname: null,
    role: null, // MAFIA, CITIZEN, POLICE, DOCTOR
    aiChanceRemaining: 0,
  },

  // === 게임 상태 ===
  gamePhase: 'WAITING', // WAITING, DAY, DAY_VOTE, DEFENSE, FINAL_VOTE, NIGHT
  phaseEndsAt: null,
  dayCount: 1,

  // === 투표 상태 ===
  vote1: {
    hasVoted: false,
    myTarget: null,
    votedPlayers: [], // 투표한 플레이어 목록 (hasVoted만 알 수 있음)
    result: null, // { selectedUserId, isTie }
  },
  vote2: {
    hasVoted: false,
    myVote: null, // true(찬성) / false(반대)
    votedPlayers: [],
    result: null, // { approved, executedUserId, counts: { agree, disagree } }
  },

  // === 밤 행동 상태 ===
  nightAction: {
    mafiaTarget: null, // 마피아가 선택한 타겟
    mafiaLocked: false, // 마피아 타겟 확정 여부
    doctorTarget: null, // 의사가 선택한 타겟
    policeTarget: null, // 경찰이 선택한 타겟
    policeResult: null, // { targetUserId, isMafia }
    hasActed: false, // 내가 행동했는지
  },

  // === AI 찬스 상태 ===
  aiChance: {
    isRequesting: false,
    targetUserId: null,
    result: null, // { targetUserId, summary, metrics }
  },

  // === 게임 결과 ===
  gameResult: null, // { winnerTeam, mvpUserId }
  nightResult: null, // { killedUserId, saved }

  // === 모달 상태 ===
  modals: {
    roleAssign: false,
    vote1Confirm: false,
    vote1Result: false,
    vote2: false,
    vote2Result: false,
    nightResult: false,
    gameEnd: false,
    aiChance: false,
    policeResult: false,
  },

  // === Actions ===

  // 방 정보 초기화
  initRoom: (roomCode) => set({
    roomCode,
    version: 0,
    players: [],
    gamePhase: 'WAITING',
    phaseEndsAt: null,
    dayCount: 1,
    vote1: { hasVoted: false, myTarget: null, votedPlayers: [], result: null },
    vote2: { hasVoted: false, myVote: null, votedPlayers: [], result: null },
    nightAction: { mafiaTarget: null, mafiaLocked: false, doctorTarget: null, policeTarget: null, policeResult: null, hasActed: false },
    aiChance: { isRequesting: false, targetUserId: null, result: null },
    gameResult: null,
    nightResult: null,
  }),

  // 플레이어 목록 설정
  setPlayers: (players) => set({ players }),

  // 플레이어 상태 업데이트 (생존 여부 등)
  updatePlayerStatus: (userId, updates) => set((state) => ({
    players: state.players.map((p) =>
      String(p.userId) === String(userId) ? { ...p, ...updates } : p
    ),
  })),

  // 내 정보 설정
  setMyInfo: (myInfo) => set((state) => ({
    myInfo: { ...state.myInfo, ...myInfo },
  })),

  // 역할 배정 (개인 채널)
  setMyRole: (role, aiChanceRemaining = 0) => set((state) => ({
    myInfo: { ...state.myInfo, role, aiChanceRemaining },
  })),

  // 게임 페이즈 변경
  setPhase: (gamePhase, phaseEndsAt = null) => set((state) => {
    const newState = { gamePhase, phaseEndsAt };

    // 페이즈 변경 시 투표/행동 상태 초기화
    if (gamePhase === 'DAY') {
      newState.vote1 = { hasVoted: false, myTarget: null, votedPlayers: [], result: null };
      newState.vote2 = { hasVoted: false, myVote: null, votedPlayers: [], result: null };
      newState.nightResult = null;
    } else if (gamePhase === 'DAY_VOTE') {
      newState.vote1 = { hasVoted: false, myTarget: null, votedPlayers: [], result: null };
    } else if (gamePhase === 'FINAL_VOTE') {
      newState.vote2 = { hasVoted: false, myVote: null, votedPlayers: [], result: null };
    } else if (gamePhase === 'NIGHT') {
      newState.nightAction = { mafiaTarget: null, mafiaLocked: false, doctorTarget: null, policeTarget: null, policeResult: state.nightAction.policeResult, hasActed: false };
    }

    return newState;
  }),

  // Day 카운트 증가
  incrementDay: () => set((state) => ({ dayCount: state.dayCount + 1 })),

  // 버전 업데이트
  setVersion: (version) => set({ version }),

  // === 투표 관련 ===

  // 1차 투표 (내가 투표함)
  setVote1: (targetUserId) => set((state) => ({
    vote1: { ...state.vote1, hasVoted: true, myTarget: targetUserId },
  })),

  // 1차 투표 진행 상황 업데이트
  updateVote1Progress: (userId, hasVoted) => set((state) => ({
    vote1: {
      ...state.vote1,
      votedPlayers: hasVoted
        ? [...state.vote1.votedPlayers.filter(id => String(id) !== String(userId)), userId]
        : state.vote1.votedPlayers.filter(id => String(id) !== String(userId)),
    },
  })),

  // 1차 투표 결과
  setVote1Result: (selectedUserId, isTie) => set((state) => ({
    vote1: { ...state.vote1, result: { selectedUserId, isTie } },
  })),

  // 2차 투표 (찬반)
  setVote2: (agree) => set((state) => ({
    vote2: { ...state.vote2, hasVoted: true, myVote: agree },
  })),

  // 2차 투표 진행 상황 업데이트
  updateVote2Progress: (userId, hasVoted) => set((state) => ({
    vote2: {
      ...state.vote2,
      votedPlayers: hasVoted
        ? [...state.vote2.votedPlayers.filter(id => String(id) !== String(userId)), userId]
        : state.vote2.votedPlayers.filter(id => String(id) !== String(userId)),
    },
  })),

  // 2차 투표 결과
  setVote2Result: (approved, executedUserId, counts) => set((state) => ({
    vote2: { ...state.vote2, result: { approved, executedUserId, counts } },
  })),

  // === 밤 행동 관련 ===

  // 마피아 타겟 제안 (마피아 채널)
  setMafiaProposal: (fromUserId, targetUserId) => set((state) => ({
    nightAction: { ...state.nightAction, mafiaTarget: targetUserId },
  })),

  // 마피아 타겟 확정
  setMafiaLocked: (targetUserId) => set((state) => ({
    nightAction: { ...state.nightAction, mafiaTarget: targetUserId, mafiaLocked: true },
  })),

  // 내 밤 행동 완료
  setMyNightAction: (targetUserId) => set((state) => ({
    nightAction: { ...state.nightAction, hasActed: true },
  })),

  // 경찰 수사 결과 (개인 채널)
  setPoliceResult: (targetUserId, isMafia) => set((state) => ({
    nightAction: { ...state.nightAction, policeResult: { targetUserId, isMafia } },
  })),

  // 밤 결과 (아침 공개)
  setNightResult: (killedUserId, saved) => set({ nightResult: { killedUserId, saved } }),

  // === AI 찬스 관련 ===

  requestAiChance: (targetUserId) => set((state) => ({
    aiChance: { ...state.aiChance, isRequesting: true, targetUserId },
  })),

  setAiChanceResult: (result) => set((state) => ({
    aiChance: { isRequesting: false, targetUserId: result.targetUserId, result },
    myInfo: { ...state.myInfo, aiChanceRemaining: state.myInfo.aiChanceRemaining - 1 },
  })),

  // === 게임 종료 ===

  setGameResult: (winnerTeam, mvpUserId) => set({
    gameResult: { winnerTeam, mvpUserId },
  }),

  // === 모달 관리 ===

  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true },
  })),

  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false },
  })),

  closeAllModals: () => set({
    modals: {
      roleAssign: false,
      vote1Confirm: false,
      vote1Result: false,
      vote2: false,
      vote2Result: false,
      nightResult: false,
      gameEnd: false,
      aiChance: false,
      policeResult: false,
    },
  }),

  // === 유틸리티 ===

  // 생존한 플레이어 목록
  getAlivePlayers: () => get().players.filter((p) => p.isAlive !== false),

  // 내가 생존해 있는지
  amIAlive: () => {
    const { players, myInfo } = get();
    const me = players.find((p) => String(p.userId) === String(myInfo.userId));
    return me?.isAlive !== false;
  },

  // 내가 마피아인지
  amIMafia: () => get().myInfo.role === 'MAFIA',

  // 내가 경찰인지
  amIPolice: () => get().myInfo.role === 'POLICE',

  // 내가 의사인지
  amIDoctor: () => get().myInfo.role === 'DOCTOR',

  // 전체 상태 리셋
  reset: () => set({
    roomCode: null,
    version: 0,
    players: [],
    myInfo: { userId: null, nickname: null, role: null, aiChanceRemaining: 0 },
    gamePhase: 'WAITING',
    phaseEndsAt: null,
    dayCount: 1,
    vote1: { hasVoted: false, myTarget: null, votedPlayers: [], result: null },
    vote2: { hasVoted: false, myVote: null, votedPlayers: [], result: null },
    nightAction: { mafiaTarget: null, mafiaLocked: false, doctorTarget: null, policeTarget: null, policeResult: null, hasActed: false },
    aiChance: { isRequesting: false, targetUserId: null, result: null },
    gameResult: null,
    nightResult: null,
    modals: {
      roleAssign: false,
      vote1Confirm: false,
      vote1Result: false,
      vote2: false,
      vote2Result: false,
      nightResult: false,
      gameEnd: false,
      aiChance: false,
      policeResult: false,
    },
  }),
}));

export default useGameStore;
