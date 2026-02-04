import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
// ***** [AI] 관련 기능 및 모달 추가 *****
import { useAnalysis } from '../analysis/UseAnalysis';

// API & Stores
import websocketClient from '../api/websocketClient';
import useGameStore from '../stores/useGameStore';

// LiveKit
import useLiveKit from '../hooks/useLiveKit';

// Components
import GameVideoSlot from '../components/game/GameVideoSlot';
import TimeScreen from '../components/game/TimeScreen';
import DiscussionPage from './DiscussionPage';

// Modals
import VoteConfirmModal from '../components/modals/VoteConfirmModal';
import RealVote from '../components/modals/RealVoteModal';
import GameAlertModal from '../components/modals/GameAlertModal';
import NothingHappenModal from '../components/modals/NothingHappenModal';
import UserSelectModal from '../components/modals/UserSelectModal';
import AiAnalysisResultModal from '../components/modals/AiAnalysisResultModal';
import LastBeggingModal from '../components/modals/LastBeggingModal';


// Refactored Modals
import RoleAssignModal from '../components/modals/game/RoleAssignModal';
import PoliceResultModal from '../components/modals/game/PoliceResultModal';
import AiChanceResultModal from '../components/modals/game/AiChanceResultModal';

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
  COUNTDOWN: '게임 시작',
  ASSIGN_ROLE: '역할 확인',
  DAY: '낮 토론',
  VOTE_1: '용의자 지목',
  DEFENSE: '최후 변론',
  VOTE_2: '찬반 투표',
  NIGHT: '밤',
  DAY_RESULT: '결과 발표',
  GAME_END: '게임 종료',
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
    phaseEndSent, setPhaseEndSent,
    vote1, setVote1, setVote1Result, updateVote1Progress,
    vote2, setVote2, setVote2Result, updateVote2Progress,
    nightAction, setMafiaProposal, setMafiaLocked, setMyNightAction, setPoliceResult,
    nightResult, setNightResult,
    gameResult, setGameResult,
    aiChance, requestAiChance, setAiChanceResult,
    modals, openModal, closeModal,
    setVersion, reset,
  } = useGameStore();

  // LiveKit 자동 연결 (방 입장 시 즉시 연결)
  const { tracks: liveTracks, localTrack, room: lkRoom } = useLiveKit(roomId);

  // 로컬 UI 상태
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showVote1ResultModal, setShowVote1ResultModal] = useState(false);
  const [showVote2ResultModal, setShowVote2ResultModal] = useState(false);
  const [showNightResultModal, setShowNightResultModal] = useState(false);
  const [nightTargetPlayer, setNightTargetPlayer] = useState(null);
  const [capacity, setCapacity] = useState(6); // 방 최대 인원

  // Refs
  const myInfoRef = useRef(myInfo);
  const playersRef = useRef(players);
  const gameFinishedPlayersRef = useRef([]);

  // ***** AI *****
  const { startAnalysis, isAnalyzing } = useAnalysis();        // 분석 시작
  const [isSelectMode, setIsSelectMode] = useState(false);     // 분석 클릭 상태
  const [analysisResult, setAnalysisResult] = useState(null);  // 분석 결과
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false); // 분석 알림 모달 상태

  useEffect(() => {
    myInfoRef.current = myInfo;
    playersRef.current = players;
  }, [myInfo, players]);

  // 마피아 멤버 추적 (밤에 마피아끼리만 화상 연결용)
  const mafiaMembersRef = useRef(new Set());
  const [mafiaMembers, setMafiaMembers] = useState(() => new Set());

  const toUserId = (value) => {
    if (value && typeof value === 'object') return value.value ?? value;
    return value;
  };

  // 초기 데이터 설정 (WaitingRoomPage에서 넘어온 경우)
  useEffect(() => {
    const state = location.state || {};

    // location.state에서 넘어온 데이터가 있으면 먼저 설정
    if (state.myInfo) {
      setMyInfo(state.myInfo);
    }
    if (state.players && state.players.length > 0) {
      setPlayers(state.players);
    }
    if (state.capacity) {
      setCapacity(state.capacity);
    }

    // roomCode만 설정 (initRoom은 전체 리셋하므로 사용하지 않음)
    useGameStore.setState({ roomCode: roomId });
  }, [location.state, roomId, setMyInfo, setPlayers]);

  // 플레이어 데이터 표준화
  const standardizedPlayers = useMemo(() => players.map(p => ({
    userId: p.userId,
    nickname: p.nickname || p.displayName || p.name,
    isHost: p.isHost || false,
    isAlive: p.isAlive ?? true,
    photo: p.profileImage || p.photo || '',
    stream: p.stream || null,
    role: p.role, // 결과 페이지 전달용
  })), [players]);

  // 게임 종료 시 결과 페이지로 자동 이동
  useEffect(() => {
    if (gameResult) {
      const winnerParam = gameResult.winnerTeam === 'MAFIA' ? 'mafia' : 'citizen';
      const playersWithRoles = standardizedPlayers.map(p => {
        const finished = gameFinishedPlayersRef.current.find(
          fp => String(fp.userId) === String(p.userId)
        );
        return finished ? { ...p, role: finished.role } : p;
      });
      navigate(`/result?winner=${winnerParam}`, {
        state: {
          gameResult: gameResult,
          players: playersWithRoles
        }
      });
    }
  }, [gameResult, navigate, standardizedPlayers]);

  // WebSocket 메시지 핸들러
  const handleSocketMessage = useCallback((msg) => {
    const { type, data } = msg;

    // [수정] 백엔드 메시지 구조 불일치(Wrapper 유무) 대응
    const payload = data || msg;

    if (import.meta.env.DEV) console.log('[Game WS]', type, payload);

    switch (type) {
      // === 방/동기화 ===
      case 'ROOM_SNAPSHOT':
        setPlayers(payload.roomState?.players || []);
        if (payload.my) {
          setMyInfo(payload.my);
          const currentRole = myInfoRef.current?.role;
          if (payload.my.role && !currentRole) {
            setMyRole(payload.my.role, payload.my.aiChanceRemaining || 0);
            setShowRoleModal(true);
            if (payload.my.role === 'MAFIA') {
              websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
            }
          }
        }
        if (payload.version) setVersion(payload.version);
        if (payload.roomState?.phase) {
          setPhase(payload.roomState.phase, payload.roomState.phaseEndsAt);
        }
        if (payload.roomState?.capacity) {
          setCapacity(payload.roomState.capacity);
        }
        break;

      // === 역할 배정 ===
      case 'ROLE_ASSIGNED':
        setMyRole(payload.role, payload.aiChanceRemaining || 0);
        setShowRoleModal(true);
        if (payload.role === 'MAFIA') {
          websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
          // 백엔드에서 마피아 멤버 목록을 보내면 활용
          if (Array.isArray(payload.mafiaMembers)) {
            payload.mafiaMembers.forEach(id => mafiaMembersRef.current.add(String(id)));
            setMafiaMembers(new Set(mafiaMembersRef.current));
          }
        }
        break;

      // === 게임 시작 ===
      case 'GAME_STARTED':
        setPhase(payload.phase, payload.phaseEndsAt);
        if (payload.version) setVersion(payload.version);
        if (payload.role) {
          setMyRole(payload.role, payload.aiChanceRemaining || 0);
          setShowRoleModal(true);
          if (payload.role === 'MAFIA') {
            websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
          }
        }
        if (payload.my?.role) {
          setMyRole(payload.my.role, payload.my.aiChanceRemaining || 0);
          setShowRoleModal(true);
          if (payload.my.role === 'MAFIA') {
            websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
          }
        }
        break;

      // === 페이즈 변경 ===
      case 'PHASE_CHANGED':
        setPhase(payload.phase, payload.phaseEndsAt);
        if (payload.version) setVersion(payload.version);
        setShowVote1ResultModal(false);
        setShowVote2ResultModal(false);
        if (payload.role && !myInfoRef.current?.role) {
          setMyRole(payload.role, payload.aiChanceRemaining || 0);
          setShowRoleModal(true);
          if (payload.role === 'MAFIA') {
            websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
          }
        }
        if (payload.my?.role && !myInfoRef.current?.role) {
          setMyRole(payload.my.role, payload.my.aiChanceRemaining || 0);
          setShowRoleModal(true);
          if (payload.my.role === 'MAFIA') {
            websocketClient.subscribeToMafiaChannel(handleMafiaMessage);
          }
        }
        break;

      // === 1차 투표 ===
      case 'VOTE1_UPDATE':
        updateVote1Progress(payload.userId, payload.hasVoted);
        if (payload.version) setVersion(payload.version);
        break;

      case 'VOTE1_RESULT':
        setVote1Result(payload.accusedUserId, payload.isTie);
        setShowVote1ResultModal(true);
        if (payload.version) setVersion(payload.version);
        break;

      // === 2차 투표 ===
      case 'VOTE2_UPDATE':
        updateVote2Progress(payload.userId, payload.hasVoted);
        if (payload.version) setVersion(payload.version);
        break;

      case 'VOTE2_RESULT':
        setVote2Result(payload.approved, payload.executedUserId, payload.counts || { agree: payload.agree, disagree: payload.disagree });
        setShowVote2ResultModal(true);
        if (payload.version) setVersion(payload.version);
        break;

      // === 플레이어 상태 변경 ===
      case 'PLAYER_STATUS_CHANGED':
        updatePlayerStatus(payload.userId, { isAlive: payload.isAlive });
        if (payload.version) setVersion(payload.version);
        break;

      // === 밤 결과 ===
      case 'NIGHT_RESOLVED':
        setNightResult(toUserId(payload.killedUserId), payload.saved);
        setShowNightResultModal(true);
        if (payload.version) setVersion(payload.version);
        break;
      case 'NIGHT_RESULT':
        setNightResult(toUserId(payload.killedUserId), payload.saved);
        setShowNightResultModal(true);
        if (payload.version) setVersion(payload.version);
        break;

      // === 경찰 수사 결과 ===
      case 'POLICE_RESULT':
        setPoliceResult(toUserId(payload.targetUserId), payload.isMafia);
        openModal('policeResult');
        break;

      // === AI 찬스 ===
      case 'AI_CHANCE_STARTED':
        break;

      case 'AI_CHANCE_RESULT':
        setAiChanceResult(payload);
        openModal('aiChance');
        break;

      // === 게임 종료 ===
      case 'GAME_FINISHED':
        if (payload.players) {
          gameFinishedPlayersRef.current = payload.players;
        }
        setGameResult(payload.winnerTeam, payload.mvpUserId);
        if (payload.version) setVersion(payload.version);
        break;

      // === 게임 재시작 ===
      case 'GAME_RESTARTED':
        if (payload.version) setVersion(payload.version);
        mafiaMembersRef.current = new Set();
        setMafiaMembers(new Set());
        navigate(`/rooms/${roomId}`, {
          state: { fromGame: true }
        });
        break;

      // === 에러 처리 ===
      case 'ERROR':
        console.error('[Game Error]', payload.message);
        break;

      default:
        break;
    }
  }, [
    setPlayers, setMyInfo, setVersion, setMyRole, setPhase,
    updateVote1Progress, setVote1Result, updateVote2Progress, setVote2Result,
    updatePlayerStatus, setNightResult, setPoliceResult, setAiChanceResult,
    setGameResult, openModal, setMafiaMembers,
  ]);

  // 마피아 전용 메시지 핸들러
  const handleMafiaMessage = useCallback((msg) => {
    const { type, data } = msg;

    if (import.meta.env.DEV) console.log('[Mafia WS]', type, data);

    switch (type) {
      case 'MAFIA_RESULT':
        setMafiaLocked(toUserId(data.targetUserId));
        break;
      case 'MAFIA_TARGET_PROPOSED': {
        const fromId = String(toUserId(data.fromUserId));
        setMafiaProposal(toUserId(data.fromUserId), toUserId(data.targetUserId));
        // 제안자를 마피아 멤버로 추적
        if (!mafiaMembersRef.current.has(fromId)) {
          mafiaMembersRef.current.add(fromId);
          setMafiaMembers(new Set(mafiaMembersRef.current));
        }
        break;
      }

      case 'MAFIA_TARGET_LOCKED':
        setMafiaLocked(toUserId(data.targetUserId));
        break;

      default:
        break;
    }
  }, [setMafiaProposal, setMafiaLocked, setMafiaMembers]);

  // WebSocket 연결
  useEffect(() => {
    websocketClient.connect(roomId, handleSocketMessage, { autoSync: true });

    return () => {
      websocketClient.unsubscribeFromMafiaChannel();
      websocketClient.disconnect();
      reset();
    };
  }, [roomId, handleSocketMessage, reset]);

  // 타이머 계산
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

  // Phase End 방식
  useEffect(() => {
    const timedPhases = ['COUNTDOWN', 'ASSIGN_ROLE', 'DAY', 'VOTE_1', 'DEFENSE', 'VOTE_2', 'NIGHT', 'DAY_RESULT'];

    if (!phaseEndsAt || phaseEndSent || !timedPhases.includes(gamePhase)) {
      return;
    }

    const now = Date.now();
    const end = new Date(phaseEndsAt).getTime();
    const actualRemaining = Math.floor((end - now) / 1000);

    if (remainingSeconds === 0 && actualRemaining <= 0) {
      setPhaseEndSent(true);
      websocketClient.sendPhaseEnd(gamePhase);

      if (import.meta.env.DEV) {
        console.log('[PhaseEnd] Sent phase end:', gamePhase, 'actualRemaining:', actualRemaining);
      }
    }
  }, [remainingSeconds, phaseEndsAt, phaseEndSent, gamePhase, setPhaseEndSent]);

  // 역할 백업 알림
  const roleAlertShownRef = useRef(false);
  useEffect(() => {
    if (myInfo.role && gamePhase !== 'WAITING' && !roleAlertShownRef.current) {
      roleAlertShownRef.current = true;
      if (!showRoleModal) {
        openModal('roleBackup');
      }
    }
    if (gamePhase === 'WAITING') {
      roleAlertShownRef.current = false;
    }
  }, [myInfo.role, gamePhase, showRoleModal, openModal]);

  // 마피아 멤버 추적: 내가 마피아일 때 자신 추가
  useEffect(() => {
    if (myInfo.role === 'MAFIA' && myInfo.userId) {
      const strId = String(myInfo.userId);
      if (!mafiaMembersRef.current.has(strId)) {
        mafiaMembersRef.current.add(strId);
        setMafiaMembers(new Set(mafiaMembersRef.current));
      }
    }
  }, [myInfo.role, myInfo.userId]);

  // 마피아 멤버 추적: players 배열의 role 정보 확인 (백엔드가 마피아 동료 role을 채워주는 경우)
  useEffect(() => {
    let changed = false;
    players.forEach(p => {
      if (p.role === 'MAFIA') {
        const strId = String(p.userId);
        if (!mafiaMembersRef.current.has(strId)) {
          mafiaMembersRef.current.add(strId);
          changed = true;
        }
      }
    });
    if (changed) setMafiaMembers(new Set(mafiaMembersRef.current));
  }, [players]);

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

  // === LiveKit 트랙 가시성 규칙 ===
  // 낥 단계: 살아있는 플레이어만 표시 (본인은 항상). 죽은 플레이어는 남들을 볼 수 있나 남들에게는 안 보임.
  // 밤 단계: 시민팀은 화면 없음. 마피아끼리만 서로를 확인.
  const getVisibleTrack = (player) => {
    const isMe = String(player.userId) === String(myInfo.userId);
    const rawTrack = isMe ? localTrack : liveTracks[String(player.userId)];

    if (['DAY', 'VOTE_1', 'DEFENSE', 'VOTE_2', 'DAY_RESULT'].includes(gamePhase)) {
      if (isMe) return rawTrack;
      return player.isAlive ? rawTrack : null;
    }

    if (gamePhase === 'NIGHT') {
      // 시민팀: 어떤 화면도 보지 못함
      if (myInfo.role !== 'MAFIA') return null;
      // 마피아: 본인 + 살아있는 마피아 동료만
      if (isMe) return rawTrack;
      return (player.isAlive && mafiaMembers.has(String(player.userId))) ? rawTrack : null;
    }

    // 기타 단계 (COUNTDOWN, ASSIGN_ROLE, DAY_RESULT 등): 제한 없음
    return rawTrack;
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
        websocketClient.sendMafiaConfirm(targetUserId);
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

  // ***** AI 찬스 관리 *****
  const handleAiChance = async (targetPlayer) => {
    // 1. 시민이 아니고 남은 찬스 없으면 못 함
    if (myInfo.role !== 'CITIZEN' || myInfo.aiChanceRemaining <= 0 || isAnalyzing) return;

    // 2. 비디오 트랙 찾기 (LiveKit 전용)
    const targetId = String(targetPlayer.userId);
    const isMe = targetId === String(myInfo.userId);

    const videoTrack = isMe ? localTrack : liveTracks[targetId];

    if (!videoTrack) {
      alert("상대방의 카메라가 꺼져 있습니다.");
      return;
    }

    // 3. 오디오 트랙 추출 (LiveKit Room을 통해)
    let audioTrack = null;
    if (lkRoom) {
      const participant = isMe
        ? lkRoom.localParticipant
        : lkRoom.getParticipantByIdentity(targetId);

      const audioPub = participant?.getTrackPublication('microphone'); // Track.Source.Microphone
      audioTrack = audioPub?.track;
    }

    setIsSelectMode(false); // 선택 완료했으니 모드 해제

    const trackBundle = {
      video: videoTrack,
      audio: audioTrack || null,
      roomId: roomId,
      round: 1 // 필요 시 현재 라운드 변수 연결
    };

    try {
      // 💡 5초 분석 시작!
      const result = await startAnalysis(trackBundle, targetId);

      if (result) {
        setAnalysisResult({ identity: targetId, narrative: result.narrative });
        openModal('aiChance');

        // 분석 성공 시에만 서버에 찬스 차감 알림
        websocketClient.sendAiChanceRequest(targetId);
        requestAiChance(targetId);
      }
    } catch (e) {
      console.error("분석 실패", e);
    }
  };

  // 피고인 정보 (2차 투표용)
  const accusedPlayer = useMemo(() => {
    if (!vote1.result?.accusedUserId) return null;
    return standardizedPlayers.find(p => String(p.userId) === String(vote1.result.accusedUserId));
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

      {/* AI 찬스 버튼 (시민, 낮에만) */}
      {myInfo.role === 'CITIZEN' && (
        <div className="absolute top-6 right-6 z-[100]">
          <button
            onClick={() => {
              // 💡 클릭 방어: 낮이고, 살아있고, 시민이고, 찬스가 있을 때만 작동
              if (gamePhase !== 'DAY' || !amIAlive || myInfo.role !== 'CITIZEN' || myInfo.aiChanceRemaining <= 0) return;

              const newSelectMode = !isSelectMode;
              setIsSelectMode(newSelectMode);
              if (newSelectMode) {
                setIsGuidanceOpen(true);
              }
            }}
            // 💡 비활성화 조건: 낮이 아니거나, 죽었거나, 시민이 아니거나, 찬스가 없거나, 분석 중일 때
            disabled={
              isAnalyzing ||
              gamePhase !== 'DAY' ||
              !amIAlive ||
              myInfo.role !== 'CITIZEN' ||
              myInfo.aiChanceRemaining <= 0
            }
            className={`px-6 py-2 rounded-full text-sm font-pretendard font-black transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-0
        ${isSelectMode
                ? "bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)] border-none" // 🔴 선택 취소: 테두리 절대 금지!
                : isAnalyzing
                  ? "bg-white text-[#69D6E3] border-2 border-[#69D6E3] animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.7)]"
                  : "bg-[#69D6E3] text-white border-2 border-white/30 hover:opacity-90 shadow-[0_0_10px_rgba(105,214,227,0.4)]"
              } 
        ${(gamePhase !== 'DAY' || !amIAlive || myInfo.aiChanceRemaining <= 0) && !isAnalyzing && !isSelectMode ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {isAnalyzing ? "분석 중..." : isSelectMode ? "선택 취소" : "킁킁 찬스"}
          </button>
        </div>
      )}

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
            <span className="text-[#69D6E3] text-xs">AI 찬스: {myInfo.aiChanceRemaining}회</span>
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
              onTimeout={() => { }}
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
                    <div className="w-full aspect-video relative group">
                      <GameVideoSlot
                        player={player}
                        isMe={String(player.userId) === String(myInfo.userId)}
                        track={getVisibleTrack(player)}
                        canVote={gamePhase === 'VOTE_1' && amIAlive}
                        didIVote={vote1.hasVoted}
                        onVoteRequest={() => handleVoteClick(player)}
                        size="normal"
                      />
                      {/* AI 선택 모드일 때만 나타나는 투명 클릭 판 */}
                      {isSelectMode && String(player.userId) !== String(myInfo.userId) && player.isAlive && (
                        <div
                          onClick={() => handleAiChance(player)}
                          className="absolute inset-0 z-[60] bg-[#69D6E3]/10 cursor-crosshair flex items-center justify-center transition-all border-4 border-[#69D6E3] rounded-xl opacity-0 group-hover:opacity-100"
                        >
                          <div className="bg-[#69D6E3] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-pulse">
                            클릭하여 분석
                          </div>
                        </div>
                      )}

                      {/* 밤 행동 버튼 (마피아/의사/경찰) */}
                      {gamePhase === 'NIGHT' && amIAlive && player.isAlive &&
                        // 의사 자가 치료 가능하도록 조건 수정
                        (String(player.userId) !== String(myInfo.userId) || myInfo.role === 'DOCTOR') &&
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
      <RoleAssignModal
        isOpen={showRoleModal}
        role={myInfo.role}
        roleInfo={ROLE_INFO[myInfo.role]}
        onClose={() => setShowRoleModal(false)}
      />

      <LastBeggingModal
        isOpen={modals.roleBackup}
        onClose={() => closeModal('roleBackup')}
        message={`당신의 역할은\n[${ROLE_INFO[myInfo.role]?.name || myInfo.role}] 입니다.`}
        subMessage={ROLE_INFO[myInfo.role]?.description}
      />

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
      {gamePhase === 'VOTE_2' && accusedPlayer && !vote2.hasVoted && amIAlive && (
        <RealVote
          accusedPlayer={accusedPlayer}
          onVoteComplete={() => { }}
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
      <PoliceResultModal
        isOpen={modals.policeResult && !!nightAction.policeResult}
        targetName={standardizedPlayers.find(p => String(p.userId) === String(nightAction.policeResult?.targetUserId))?.nickname}
        isMafia={nightAction.policeResult?.isMafia}
        onClose={() => closeModal('policeResult')}
      />

      {/* AI 분석 결과 모달 (여기에 두세요!) */}
      <AiAnalysisResultModal
        isOpen={modals.aiChance}           // Zustand 상자에서 '열림' 상태 가져오기
        result={aiChance.result}           // AI가 분석한 (identity, narrative) 데이터
        onClose={() => closeModal('aiChance')} // 닫기 버튼 누르면 상자 닫기
      />

      {/* 안내 모달 (얼굴 클릭하라는 창) */}
      <UserSelectModal
        isOpen={isGuidanceOpen}
        onClose={() => setIsGuidanceOpen(false)}
      />
    </div>
  );
};

export default GamePage;