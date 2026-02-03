import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// API & Stores
import websocketClient from '../api/websocketClient';
import useGameStore from '../stores/useGameStore';

// Components
import GameVideoSlot from '../components/game/GameVideoSlot';
import TimeScreen from '../components/game/TimeScreen';
import DiscussionPage from './DiscussionPage';

// Modals
import VoteConfirmModal from '../components/modals/VoteConfirmModal';
import RealVote from '../components/modals/RealVoteModal';
import GameAlertModal from '../components/modals/GameAlertModal';
import NothingHappenModal from '../components/modals/NothingHappenModal';

// 시간 포맷 유틸리티
const formatTime = (seconds) => {
  if (seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// 페이즈 한글 이름
const PHASE_NAMES = {
  WAITING: '대기 중',
  DAY: '낮 토론',
  DAY_VOTE: '용의자 지목',
  DEFENSE: '최후 변론',
  FINAL_VOTE: '찬반 투표',
  NIGHT: '밤',
};

// 역할 한글 이름 및 설명
const ROLE_INFO = {
  MAFIA: { name: '마피아', color: 'text-red-500', description: '밤에 시민을 죽일 수 있습니다.' },
  CITIZEN: { name: '시민', color: 'text-green-500', description: 'AI 찬스를 2회 사용할 수 있습니다.' },
  POLICE: { name: '경찰', color: 'text-blue-500', description: '밤에 한 명을 조사할 수 있습니다.' },
  DOCTOR: { name: '의사', color: 'text-yellow-500', description: '밤에 한 명을 치료할 수 있습니다.' },
};

const GamePage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Zustand Store
  const {
    players, setPlayers, updatePlayerStatus,
    myInfo, setMyInfo, setMyRole,
    gamePhase, setPhase, phaseEndsAt,
    vote1, setVote1, setVote1Result, updateVote1Progress,
    vote2, setVote2, setVote2Result, updateVote2Progress,
    nightAction, setMafiaProposal, setMafiaLocked, setMyNightAction, setPoliceResult,
    nightResult, setNightResult,
    gameResult, setGameResult,
    aiChance, requestAiChance, setAiChanceResult,
    modals, openModal, closeModal,
    initRoom, setVersion, reset,
  } = useGameStore();

  // 로컬 UI 상태
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showVote1ResultModal, setShowVote1ResultModal] = useState(false);
  const [showVote2ResultModal, setShowVote2ResultModal] = useState(false);
  const [showNightResultModal, setShowNightResultModal] = useState(false);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [nightTargetPlayer, setNightTargetPlayer] = useState(null);
  const [capacity, setCapacity] = useState(6); // 방 최대 인원

  // Refs
  const myInfoRef = useRef(myInfo);
  const playersRef = useRef(players);

  useEffect(() => {
    myInfoRef.current = myInfo;
    playersRef.current = players;
  }, [myInfo, players]);

  // 초기 데이터 설정 (WaitingRoomPage에서 넘어온 경우)
  useEffect(() => {
    const state = location.state || {};
    if (state.myInfo) {
      setMyInfo(state.myInfo);
    }
    if (state.players && state.players.length > 0) {
      setPlayers(state.players);
    }
    if (state.capacity) {
      setCapacity(state.capacity);
    }
    initRoom(roomId);
  }, [location.state, roomId, setMyInfo, setPlayers, initRoom]);

  // WebSocket 메시지 핸들러
  const handleSocketMessage = useCallback((msg) => {
    const { type, data } = msg;

    if (import.meta.env.DEV) console.log('[Game WS]', type, data);

    switch (type) {
      // === 방/동기화 ===
      case 'ROOM_SNAPSHOT':
        setPlayers(data.roomState?.players || []);
        if (data.my) {
          setMyInfo(data.my);
          // ROOM_SNAPSHOT에서 역할 정보가 있고 아직 역할이 설정되지 않았다면 역할 모달 표시
          const currentRole = myInfoRef.current?.role;
          if (data.my.role && !currentRole) {
            setMyRole(data.my.role, data.my.aiChanceRemaining || 0);
            setShowRoleModal(true);
            // 마피아인 경우 마피아 채널 구독
            if (data.my.role === 'MAFIA') {
              websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
            }
          }
        }
        if (data.version) setVersion(data.version);
        // 페이즈 정보가 있으면 설정
        if (data.roomState?.phase) {
          setPhase(data.roomState.phase, data.roomState.phaseEndsAt);
        }
        // capacity 정보가 있으면 설정
        if (data.roomState?.capacity) {
          setCapacity(data.roomState.capacity);
        }
        break;

      // === 역할 배정 (개인 채널) - 백엔드가 별도 메시지를 보내는 경우 ===
      case 'ROLE_ASSIGNED':
        setMyRole(data.role, data.aiChanceRemaining || 0);
        setShowRoleModal(true);
        // 마피아인 경우 마피아 채널 구독
        if (data.role === 'MAFIA') {
          websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
        }
        break;

      // === 게임 시작 ===
      case 'GAME_STARTED':
        setPhase(data.phase, data.phaseEndsAt);
        if (data.version) setVersion(data.version);
        // 게임 시작 시 역할 정보가 포함되어 있으면 역할 모달 표시
        if (data.role) {
          setMyRole(data.role, data.aiChanceRemaining || 0);
          setShowRoleModal(true);
          if (data.role === 'MAFIA') {
            websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
          }
        }
        // my 객체에 역할 정보가 있는 경우
        if (data.my?.role) {
          setMyRole(data.my.role, data.my.aiChanceRemaining || 0);
          setShowRoleModal(true);
          if (data.my.role === 'MAFIA') {
            websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
          }
        }
        break;

      // === 페이즈 변경 ===
      case 'PHASE_CHANGED':
        setPhase(data.phase, data.phaseEndsAt);
        if (data.version) setVersion(data.version);
        // 페이즈별 모달 리셋
        setShowVote1ResultModal(false);
        setShowVote2ResultModal(false);
        // 첫 DAY 페이즈에서 역할 정보가 함께 올 경우
        if (data.role && !myInfoRef.current?.role) {
          setMyRole(data.role, data.aiChanceRemaining || 0);
          setShowRoleModal(true);
          if (data.role === 'MAFIA') {
            websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
          }
        }
        if (data.my?.role && !myInfoRef.current?.role) {
          setMyRole(data.my.role, data.my.aiChanceRemaining || 0);
          setShowRoleModal(true);
          if (data.my.role === 'MAFIA') {
            websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
          }
        }
        break;

      // === 1차 투표 ===
      case 'VOTE1_UPDATE':
        updateVote1Progress(data.userId, data.hasVoted);
        if (data.version) setVersion(data.version);
        break;

      case 'VOTE1_RESULT':
        setVote1Result(data.selectedUserId, data.isTie);
        setShowVote1ResultModal(true);
        if (data.version) setVersion(data.version);
        break;

      // === 2차 투표 ===
      case 'VOTE2_UPDATE':
        updateVote2Progress(data.userId, data.hasVoted);
        if (data.version) setVersion(data.version);
        break;

      case 'VOTE2_RESULT':
        setVote2Result(data.approved, data.executedUserId, data.counts);
        setShowVote2ResultModal(true);
        if (data.version) setVersion(data.version);
        break;

      // === 플레이어 상태 변경 (사망 등) ===
      case 'PLAYER_STATUS_CHANGED':
        updatePlayerStatus(data.userId, { isAlive: data.isAlive });
        if (data.version) setVersion(data.version);
        break;

      // === 밤 결과 (아침에 공개) ===
      case 'NIGHT_RESOLVED':
        setNightResult(data.killedUserId, data.saved);
        setShowNightResultModal(true);
        if (data.version) setVersion(data.version);
        break;

      // === 경찰 수사 결과 (개인 채널) ===
      case 'POLICE_RESULT':
        setPoliceResult(data.targetUserId, data.isMafia);
        openModal('policeResult');
        break;

      // === AI 찬스 ===
      case 'AI_CHANCE_STARTED':
        // AI 분석 시작됨
        break;

      case 'AI_CHANCE_RESULT':
        setAiChanceResult(data);
        openModal('aiChance');
        break;

      // === 게임 종료 ===
      case 'GAME_FINISHED':
        setGameResult(data.winnerTeam, data.mvpUserId);
        setShowGameEndModal(true);
        if (data.version) setVersion(data.version);
        break;

      // === 에러 처리 ===
      case 'ERROR':
        console.error('[Game Error]', data.message);
        break;

      default:
        break;
    }
  }, [
    setPlayers, setMyInfo, setVersion, setMyRole, setPhase,
    updateVote1Progress, setVote1Result, updateVote2Progress, setVote2Result,
    updatePlayerStatus, setNightResult, setPoliceResult, setAiChanceResult,
    setGameResult, openModal,
  ]);

  // 마피아 전용 메시지 핸들러
  const handleMafiaMessage = useCallback((msg) => {
    const { type, data } = msg;

    if (import.meta.env.DEV) console.log('[Mafia WS]', type, data);

    switch (type) {
      case 'MAFIA_TARGET_PROPOSED':
        setMafiaProposal(data.fromUserId, data.targetUserId);
        break;

      case 'MAFIA_TARGET_LOCKED':
        setMafiaLocked(data.targetUserId);
        break;

      default:
        break;
    }
  }, [setMafiaProposal, setMafiaLocked]);

  // WebSocket 연결
  useEffect(() => {
    websocketClient.connect(roomId, handleSocketMessage);

    return () => {
      websocketClient.unsubscribeFromMafiaChannel();
      websocketClient.disconnect();
      reset();
    };
  }, [roomId, handleSocketMessage, reset]);

  // 타이머 계산 (서버 시간 기반)
  useEffect(() => {
    if (!phaseEndsAt) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(phaseEndsAt).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setRemainingSeconds(diff);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [phaseEndsAt]);

  // 역할 백업 알림 (모달이 안 보일 경우 alert로 알림)
  const roleAlertShownRef = useRef(false);
  useEffect(() => {
    // 역할이 있고, 게임이 시작되었고(DAY 이후), 아직 alert를 안 보였으면
    if (myInfo.role && gamePhase !== 'WAITING' && !roleAlertShownRef.current) {
      roleAlertShownRef.current = true;
      // 모달이 안 보이고 있으면 alert로 백업
      if (!showRoleModal) {
        const roleInfo = ROLE_INFO[myInfo.role];
        alert(`당신의 역할: ${roleInfo?.name || myInfo.role}\n${roleInfo?.description || ''}`);
      }
    }
    // 게임이 끝나면 다음 게임을 위해 리셋
    if (gamePhase === 'WAITING') {
      roleAlertShownRef.current = false;
    }
  }, [myInfo.role, gamePhase, showRoleModal]);

  // 플레이어 데이터 표준화
  const standardizedPlayers = useMemo(() => players.map(p => ({
    userId: p.userId,
    nickname: p.nickname || p.displayName || p.name,
    isHost: p.isHost || false,
    isAlive: p.isAlive ?? true,
    photo: p.profileImage || p.photo || '',
    stream: p.stream || null,
  })), [players]);

  // 생존자 목록
  const alivePlayers = useMemo(() =>
    standardizedPlayers.filter(p => p.isAlive),
    [standardizedPlayers]
  );

  // 내가 생존해 있는지
  const amIAlive = useMemo(() => {
    const me = standardizedPlayers.find(p => String(p.userId) === String(myInfo.userId));
    return me?.isAlive !== false;
  }, [standardizedPlayers, myInfo.userId]);

  // 그리드 레이아웃 계산
  const getFlexBasis = (capacity) => {
    if (capacity <= 4) return 'basis-[calc(50%-1.5rem)]';
    if (capacity <= 6) return 'basis-[calc(33.33%-1.5rem)]';
    return 'basis-[calc(25%-1.5rem)]';
  };

  // === 투표 핸들러 ===
  const handleVoteClick = (player) => {
    if (vote1.hasVoted || !amIAlive) return;
    setSelectedPlayer(player);
    setIsVoteModalOpen(true);
  };

  const handleVoteConfirm = () => {
    if (!selectedPlayer || vote1.hasVoted) return;

    websocketClient.sendVote1(selectedPlayer.userId);
    setVote1(selectedPlayer.userId);
    setIsVoteModalOpen(false);
    setSelectedPlayer(null);
  };

  // === 2차 투표 (찬반) 핸들러 ===
  const handleFinalVote = (agree) => {
    if (vote2.hasVoted || !amIAlive) return;

    websocketClient.sendVote2(agree);
    setVote2(agree);
  };

  // === 밤 행동 핸들러 ===
  const handleNightAction = (targetPlayer) => {
    if (nightAction.hasActed || !amIAlive || gamePhase !== 'NIGHT') return;

    const targetUserId = targetPlayer.userId;

    switch (myInfo.role) {
      case 'MAFIA':
        websocketClient.sendMafiaPropose(targetUserId);
        break;
      case 'DOCTOR':
        websocketClient.sendDoctorSelect(targetUserId);
        setMyNightAction(targetUserId);
        break;
      case 'POLICE':
        websocketClient.sendPoliceSelect(targetUserId);
        setMyNightAction(targetUserId);
        break;
      default:
        break;
    }

    setNightTargetPlayer(targetPlayer);
  };

  // === AI 찬스 핸들러 (시민만) ===
  const handleAiChance = (targetPlayer) => {
    if (myInfo.role !== 'CITIZEN' || myInfo.aiChanceRemaining <= 0) return;

    websocketClient.sendAiChanceRequest(targetPlayer.userId);
    requestAiChance(targetPlayer.userId);
  };

  // === 게임 종료 후 결과 페이지로 이동 ===
  const handleGoToResult = () => {
    navigate('/result', { state: { gameResult, players: standardizedPlayers } });
  };

  // 피고인 정보 (2차 투표용)
  const accusedPlayer = useMemo(() => {
    if (!vote1.result?.selectedUserId) return null;
    return standardizedPlayers.find(p => String(p.userId) === String(vote1.result.selectedUserId));
  }, [vote1.result, standardizedPlayers]);

  // 밤 사망자 정보
  const killedPlayer = useMemo(() => {
    if (!nightResult?.killedUserId) return null;
    return standardizedPlayers.find(p => String(p.userId) === String(nightResult.killedUserId));
  }, [nightResult, standardizedPlayers]);

  // === 렌더링 ===
  return (
    <div className="h-screen w-full bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* 상단 시간 표시 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100]">
        <TimeScreen timeLeft={formatTime(remainingSeconds)} gameStatus={gamePhase} />
      </div>

      {/* 페이즈 및 역할 정보 */}
      <div className="absolute top-6 left-6 z-[100] flex flex-col gap-2">
        <div className="bg-black/60 px-4 py-2 rounded-lg border border-white/10">
          <span className="text-white/70 text-sm">{PHASE_NAMES[gamePhase] || gamePhase}</span>
        </div>
        {myInfo.role && (
          <div className={`bg-black/60 px-4 py-2 rounded-lg border border-white/10`}>
            <span className={`text-sm font-bold ${ROLE_INFO[myInfo.role]?.color || 'text-white'}`}>
              {ROLE_INFO[myInfo.role]?.name || myInfo.role}
            </span>
          </div>
        )}
        {myInfo.role === 'CITIZEN' && myInfo.aiChanceRemaining > 0 && (
          <div className="bg-black/60 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-yellow-400 text-xs">AI 찬스: {myInfo.aiChanceRemaining}회</span>
          </div>
        )}
      </div>

      {/* 메인 영역 */}
      <main className="flex-1 w-full h-full max-w-[1800px] mx-auto relative flex flex-col pt-20">
        {gamePhase === 'DEFENSE' && accusedPlayer ? (
          <div className="w-full h-full">
            <DiscussionPage
              roomSession={{
                gameState: { trial: { accusedUserId: accusedPlayer.userId } },
                players: standardizedPlayers
              }}
              onTimeout={() => {}}
            />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center content-center gap-4 w-full h-full max-h-[85vh] pt-4 px-8">
            {/* capacity 만큼 슬롯 생성 (대기방처럼) */}
            {Array.from({ length: capacity }).map((_, index) => {
              const player = standardizedPlayers[index];

              return (
                <div
                  key={player ? player.userId : `empty-${index}`}
                  className={`flex-grow-0 flex-shrink-0 ${getFlexBasis(capacity)} min-w-[280px] max-w-[400px] transition-all duration-500`}
                >
                  {player ? (
                    <div className="w-full aspect-video relative">
                      <GameVideoSlot
                        player={player}
                        isMe={String(player.userId) === String(myInfo.userId)}
                        canVote={gamePhase === 'DAY_VOTE' && amIAlive}
                        didIVote={vote1.hasVoted}
                        onVoteRequest={() => handleVoteClick(player)}
                        size="normal"
                      />

                      {/* 밤 행동 버튼 (마피아/의사/경찰) */}
                      {gamePhase === 'NIGHT' && amIAlive && player.isAlive &&
                       String(player.userId) !== String(myInfo.userId) &&
                       ['MAFIA', 'DOCTOR', 'POLICE'].includes(myInfo.role) && (
                        <button
                          onClick={() => handleNightAction(player)}
                          disabled={nightAction.hasActed}
                          className={`absolute bottom-3 right-3 z-50 px-3 py-1 rounded-full text-xs font-bold transition-all
                            ${nightAction.hasActed
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-purple-600 hover:bg-purple-500 text-white'
                            }`}
                        >
                          {myInfo.role === 'MAFIA' ? '습격' : myInfo.role === 'DOCTOR' ? '치료' : '조사'}
                        </button>
                      )}

                      {/* AI 찬스 버튼 (시민, 낮에만) */}
                      {gamePhase === 'DAY' && amIAlive &&
                       myInfo.role === 'CITIZEN' && myInfo.aiChanceRemaining > 0 &&
                       String(player.userId) !== String(myInfo.userId) && player.isAlive && (
                        <button
                          onClick={() => handleAiChance(player)}
                          className="absolute bottom-3 left-3 z-50 px-3 py-1 rounded-full text-xs font-bold
                                     bg-yellow-600 hover:bg-yellow-500 text-white transition-all"
                        >
                          AI 분석
                        </button>
                      )}
                    </div>
                  ) : (
                    /* 빈 슬롯 (대기방 스타일) */
                    <div className="w-full aspect-video bg-[#1a1a1a]/50 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
                      <span className="text-white/20 text-sm font-medium tracking-wider">
                        EMPTY
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 배경 색상 (낮/밤) */}
      <div className={`absolute inset-0 -z-10 transition-colors duration-1000
        ${gamePhase === 'NIGHT' ? 'bg-blue-900/20' : 'bg-orange-900/10'}`}
      />

      {/* === 모달들 === */}

      {/* 역할 배정 모달 */}
      {showRoleModal && myInfo.role && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="text-center">
            <h1 className="text-5xl font-black text-white mb-8">당신의 역할은</h1>
            <div className={`text-7xl font-black ${ROLE_INFO[myInfo.role]?.color} mb-6`}>
              {ROLE_INFO[myInfo.role]?.name}
            </div>
            <p className="text-xl text-gray-300 mb-12">{ROLE_INFO[myInfo.role]?.description}</p>
            <button
              onClick={() => setShowRoleModal(false)}
              className="px-8 py-3 bg-[#ff8a00] text-white font-bold rounded-full hover:bg-orange-500 transition-all"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 1차 투표 확인 모달 */}
      <VoteConfirmModal
        isOpen={isVoteModalOpen}
        targetName={selectedPlayer?.nickname}
        phaseSeconds={remainingSeconds}
        onClose={() => setIsVoteModalOpen(false)}
        onConfirm={handleVoteConfirm}
      />

      {/* 1차 투표 결과 모달 */}
      {showVote1ResultModal && (
        <GameAlertModal
          title="VOTE RESULT"
          targetPlayer={accusedPlayer}
          message={vote1.result?.isTie
            ? "동점으로 투표가 무효되었습니다."
            : "피고인으로 지목되었습니다."
          }
          onTimeout={() => setShowVote1ResultModal(false)}
        />
      )}

      {/* 2차 투표 (찬반) 모달 */}
      {gamePhase === 'FINAL_VOTE' && accusedPlayer && !vote2.hasVoted && amIAlive && (
        <RealVote
          accusedPlayer={accusedPlayer}
          onVoteComplete={() => {}}
          onVote={handleFinalVote}
        />
      )}

      {/* 2차 투표 결과 모달 */}
      {showVote2ResultModal && (
        <GameAlertModal
          title="VERDICT"
          targetPlayer={accusedPlayer}
          message={vote2.result?.approved
            ? "처형되었습니다."
            : "생존했습니다."
          }
          onTimeout={() => setShowVote2ResultModal(false)}
        />
      )}

      {/* 밤 결과 모달 */}
      {showNightResultModal && (
        killedPlayer ? (
          <GameAlertModal
            title="NIGHT RESULT"
            targetPlayer={killedPlayer}
            message="밤에 사망했습니다."
            onTimeout={() => setShowNightResultModal(false)}
          />
        ) : (
          <NothingHappenModal onTimeout={() => setShowNightResultModal(false)} />
        )
      )}

      {/* 경찰 수사 결과 모달 */}
      {modals.policeResult && nightAction.policeResult && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="text-center">
            <h1 className="text-4xl font-black text-blue-400 mb-8">수사 결과</h1>
            <p className="text-2xl text-white mb-6">
              {standardizedPlayers.find(p => String(p.userId) === String(nightAction.policeResult.targetUserId))?.nickname}님은
            </p>
            <div className={`text-5xl font-black mb-12 ${nightAction.policeResult.isMafia ? 'text-red-500' : 'text-green-500'}`}>
              {nightAction.policeResult.isMafia ? '마피아입니다!' : '마피아가 아닙니다.'}
            </div>
            <button
              onClick={() => closeModal('policeResult')}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-all"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* AI 찬스 결과 모달 */}
      {modals.aiChance && aiChance.result && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-black text-yellow-400 mb-8">AI 분석 결과</h1>
            <p className="text-xl text-white mb-4">
              {standardizedPlayers.find(p => String(p.userId) === String(aiChance.result.targetUserId))?.nickname}님
            </p>
            <div className="bg-black/50 rounded-xl p-6 mb-8 border border-yellow-500/30">
              <p className="text-lg text-gray-200">{aiChance.result.summary}</p>
              {aiChance.result.metrics && (
                <div className="mt-4 flex justify-center gap-8">
                  <div>
                    <span className="text-gray-400 text-sm">긴장도</span>
                    <div className="text-2xl font-bold text-yellow-400">
                      {Math.round(aiChance.result.metrics.tension * 100)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">신뢰도</span>
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round(aiChance.result.metrics.confidence * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => closeModal('aiChance')}
              className="px-8 py-3 bg-yellow-600 text-white font-bold rounded-full hover:bg-yellow-500 transition-all"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 게임 종료 모달 */}
      {showGameEndModal && gameResult && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-md">
          <div className="text-center">
            <h1 className={`text-6xl font-black mb-8
              ${gameResult.winnerTeam === 'CITIZEN' ? 'text-green-500' : 'text-red-500'}`}>
              {gameResult.winnerTeam === 'CITIZEN' ? '시민 승리!' : '마피아 승리!'}
            </h1>
            {gameResult.mvpUserId && (
              <p className="text-2xl text-yellow-400 mb-12">
                MVP: {standardizedPlayers.find(p => String(p.userId) === String(gameResult.mvpUserId))?.nickname}
              </p>
            )}
            <button
              onClick={handleGoToResult}
              className="px-8 py-4 bg-[#ff8a00] text-white text-xl font-bold rounded-full hover:bg-orange-500 transition-all"
            >
              결과 확인하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
