import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Settings, Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react';

// API & Utils
import websocketClient from '../api/websocketClient';
import { updateRoomInfo } from '../api/roomApi'; 

// Components
import LoadingPage from './LoadingPage';
import CreatorWaitingPage from './CreatorWaitingPage';
import UserWaitingPage from './UserWaitingPage';
import GameStartCountdown from '../components/waiting/GameStartCountdown';
import CreateGameModal from '../components/modals/CreateGameModal';
import GameAlertModal from '../components/modals/GameAlertModal';

const WaitingRoomPage = () => {
  const { roomId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();

  // --- 상태 관리 ---
  const [players, setPlayers] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [myInfo, setMyInfo] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // 로컬 UI 상태
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Ref (최신 상태 참조용)
  const myInfoRef = useRef(myInfo);
  const locationRef = useRef(location);

  useEffect(() => {
    myInfoRef.current = myInfo;
    locationRef.current = location;
  }, [myInfo, location]);

  // --- 소켓 메시지 핸들러 ---
  const handleSocketMessage = useCallback((msg) => {
    const { type, data } = msg;

    if (import.meta.env.DEV) console.log("[WS Recv]", type, data);

    switch (type) {
      case 'JOIN_ACK':
        setPlayers(data.roomState.players);
        
        const createdData = locationRef.current.state?.createdData;
        const initialCapacity = createdData?.capacity || data.roomState.capacity || 8;
        const initialTitle = createdData?.title || data.roomState.title || "즐거운 마피아 게임";
        const initialPrivate = createdData?.isPrivate || (data.roomState.status === 'PRIVATE') || false;

        let rawCode = data.roomState.roomCode || roomId;
        if (typeof rawCode === 'string' && rawCode.includes('RoomId[value=')) {
           rawCode = rawCode.replace('RoomId[value=', '').replace(']', '');
        }

        setRoomInfo({
          title: initialTitle,
          capacity: initialCapacity,
          hostUserId: data.roomState.hostUserId,
          status: initialPrivate ? 'PRIVATE' : 'WAITING',
          inviteCode: rawCode,
          isPrivate: initialPrivate
        });
        setMyInfo(data.my);
        break;

      case 'ROOM_PLAYER_JOINED':
        setPlayers((prev) => {
          const newPlayer = data.player;
          // ID를 문자열로 변환하여 중복 방지 및 비교
          if (prev.find(p => String(p.userId) === String(newPlayer.userId))) return prev;
          return [...prev, newPlayer];
        });
        if (data.roomState) {
          setRoomInfo(prev => ({ ...prev, hostUserId: data.roomState.hostUserId }));
        }
        break;

      case 'ROOM_PLAYER_LEFT':
        setPlayers((prev) => prev.filter(p => String(p.userId) !== String(data.userId)));
        if (data.roomState) {
          setRoomInfo(prev => ({ ...prev, hostUserId: data.roomState.hostUserId }));
        }
        break;

      case 'PLAYER_STATUS_CHANGED':
      case 'ROOM_READY_UPDATED':
        console.log("🔥 [Ready Update Recv]", data); 

        // 1. 전체 플레이어 목록 갱신 (ID 문자열 비교)
        setPlayers((prev) => prev.map(p => 
          String(p.userId) === String(data.userId) ? { ...p, ready: data.ready } : p
        ));

        // 2. 내 상태(myInfo) 갱신 -> 버튼 색상 변경 트리거
        if (myInfoRef.current && String(data.userId) === String(myInfoRef.current.userId)) {
          console.log("✅ 내 레디 상태 변경됨:", data.ready);
          setMyInfo(prev => ({ ...prev, ready: data.ready }));
        }
        break;

      case 'GAME_COUNTDOWN':
        setCountdown(data.seconds);
        break;

      case 'GAME_COUNTDOWN_CANCELLED':
        setCountdown(null);
        break;

      case 'PHASE_CHANGED':
        navigate(`/game/${roomId}`, { 
          state: { myInfo: myInfoRef.current, players } 
        });
        break;

      case 'KICKED':
        alert(data.reason || "방장에 의해 강퇴되었습니다.");
        try { websocketClient.disconnect(); } catch(e) {}
        navigate('/rooms');
        break;
      
      case 'JOIN_REJECTED':
      case 'ERROR':
        setErrorMsg(data.message || "오류가 발생했습니다.");
        if (type === 'JOIN_REJECTED' && !data.retryable) {
          navigate('/rooms');
        }
        break;

      default:
        break;
    }
  }, [navigate, roomId]);

  // --- 소켓 연결 ---
  useEffect(() => {
    const onMessage = (msg) => handleSocketMessage(msg);
    websocketClient.connect(roomId, onMessage);
    return () => {
      websocketClient.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); 

  // --- 핸들러 ---
  const handleToggleReady = () => {
    // Ref를 사용해 최신 상태를 가져옴
    const currentInfo = myInfoRef.current;
    if (!currentInfo) return;
    
    const nextState = !currentInfo.ready;
    console.log("📤 [Send Ready]", nextState);

    // ✅ [핵심 수정] requestId를 포함하여 전송 (백엔드 요구사항 충족)
    websocketClient.publish('ready', { 
      ready: nextState,
      requestId: `req-${Date.now()}` 
    });
  };

  const handleKickUser = (targetUserId) => {
    // 강퇴 시에도 requestId 필요할 수 있으므로 확인 필요 (보통 공통 포맷 사용)
    websocketClient.publish('kick', { 
      targetUserId,
      requestId: `req-${Date.now()}` 
    });
  };

  const handleUpdateRoom = async (newData) => {
    try {
      if (updateRoomInfo) await updateRoomInfo(roomId, newData);
      setRoomInfo(prev => ({ ...prev, ...newData }));
      setIsSettingsOpen(false);
    } catch (err) {
      console.error("방 정보 수정 실패:", err);
      // 로컬 낙관적 업데이트
      setRoomInfo(prev => ({ ...prev, ...newData }));
      setIsSettingsOpen(false);
    }
  };

  const handleExit = () => {
    if (window.confirm("정말 방을 나가시겠습니까?")) {
      try { 
        websocketClient.publish('leave', { requestId: `req-${Date.now()}` }); 
      } catch (e) {}
      websocketClient.disconnect();
      navigate('/rooms');
    }
  };

  // --- 렌더링 ---
  if (!roomInfo || !myInfo) return <LoadingPage message="대기방 입장 중..." />;

  const amIHost = myInfo.userId === roomInfo.hostUserId;
  // 내 레디 상태 (boolean 변환)
  const amIReady = myInfo.ready === true; 

  const formattedPlayers = players.map(p => ({
    userId: p.userId,
    name: p.nickname || p.displayName, 
    isHost: p.userId === roomInfo.hostUserId,
    isReady: p.ready,
    isMicOn: p.userId === myInfo.userId ? isMicOn : false, 
    isVideoOn: p.userId === myInfo.userId ? isVideoOn : true,
    photo: p.profileImage, 
  }));

  return (
    <div className="fixed inset-0 z-[100] w-full h-screen overflow-hidden bg-black text-white selection:bg-orange-500/30">

      {/* 배경 */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0f]">
        <img src="/assets/images/waitingroom/bg_main.png" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 w-full flex items-center justify-center pt-4 pb-1 px-12">
        <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_10px_rgba(255,100,0,0.5)] tracking-tighter truncate max-w-2xl min-w-[200px] text-center pr-4">
          {roomInfo.title}
        </h1>
        {amIHost && (
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="absolute right-8 top-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all border border-white/5 hover:border-orange-500/50"
          >
            <Settings size={20} />
          </button>
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 w-full h-full pt-0 overflow-hidden">
         {amIHost ? (
            <CreatorWaitingPage 
              roomInfo={roomInfo}
              players={formattedPlayers}
              myId={myInfo.userId}
              onKick={handleKickUser}
              onUpdate={handleUpdateRoom}
            />
         ) : (
            <UserWaitingPage 
              players={formattedPlayers}
              myId={myInfo.userId}
              capacity={roomInfo.capacity}
              onReady={handleToggleReady}
            />
         )}
      </main>

      {/* 하단 컨트롤 바 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0a0a0f]/95 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-2xl">
        <button onClick={() => setIsMicOn(!isMicOn)} className={`p-2.5 rounded-full border ${isMicOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-2.5 rounded-full border ${isVideoOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <div className="w-[1px] h-8 bg-white/10 mx-1" />
        
        {/* 레디 버튼 (상태에 따라 색상 변경) */}
        <button
          onClick={handleToggleReady}
          className={`
            group relative px-8 py-2.5 rounded-full font-black text-lg italic tracking-wider transition-all duration-300 overflow-hidden shadow-lg min-w-[140px] flex items-center justify-center border-2
            ${amIReady 
              ? 'bg-[#ff8a00] border-[#ff8a00] text-white shadow-[0_0_20px_rgba(255,138,0,0.5)] hover:bg-[#e67e00]' 
              : 'bg-white border-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]'
            }
          `}
        >
          <span className="relative z-10">
             {amIReady ? "CANCEL" : "READY"}
          </span>
          {amIReady && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
        </button>

        <div className="w-[1px] h-8 bg-white/10 mx-1" />
        <button onClick={handleExit} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 transition-all text-white/70">
          <LogOut size={20} />
        </button>
      </div>

      {/* 모달 */}
      {isSettingsOpen && amIHost && (
        <CreateGameModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          initialData={roomInfo}
          isEdit={true}
          isHost={true}
          inviteCode={roomInfo.inviteCode}
          onSave={handleUpdateRoom}
        />
      )}
      
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
           <GameStartCountdown count={countdown} onComplete={() => console.log("Start!")} />
        </div>
      )}

      {errorMsg && (
        <GameAlertModal isOpen={!!errorMsg} onClose={() => setErrorMsg(null)} message={errorMsg} />
      )}

    </div>
  );
};

export default WaitingRoomPage;