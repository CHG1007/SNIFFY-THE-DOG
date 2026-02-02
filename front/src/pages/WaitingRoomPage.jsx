import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Settings, Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react';

// API & Utils
import websocketClient from '../api/websocketClient';
import { updateRoomInfo } from '../api/roomApi';

// Components
import LoadingPage from './LoadingPage';
import WaitingGrid from '../components/waiting/WaitingGrid';
import GameStartCountdown from '../components/waiting/GameStartCountdown';

// Modals
import CreateGameModal from '../components/modals/CreateGameModal';
import LastBeggingModal from '../components/modals/LastBeggingModal';
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

  // --- 로컬 UI 상태 ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [targetKickPlayer, setTargetKickPlayer] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // ✅ [Logic 1] 최신 상태 참조를 위한 Ref (첫 번째 코드 로직)
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
        // [Logic 1] 데이터 파싱 로직 적용
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
          // [Logic 1] String 변환 비교로 중복 방지
          if (prev.find(p => String(p.userId) === String(newPlayer.userId))) return prev;
          return [...prev, newPlayer];
        });
        if (data.roomState) {
          setRoomInfo(prev => ({ ...prev, hostUserId: data.roomState.hostUserId }));
        }
        break;

      case 'ROOM_PLAYER_LEFT':
        // [Logic 1] String 변환 비교
        setPlayers((prev) => prev.filter(p => String(p.userId) !== String(data.userId)));
        if (data.roomState) {
          setRoomInfo(prev => ({ ...prev, hostUserId: data.roomState.hostUserId }));
        }
        break;

      case 'PLAYER_STATUS_CHANGED':
      case 'ROOM_READY_UPDATED':
        console.log("🔥 [Ready Update Recv]", data); 
        // [Logic 1] 안전한 상태 업데이트
        setPlayers((prev) => prev.map(p => 
          String(p.userId) === String(data.userId) ? { ...p, ready: data.ready } : p
        ));
        if (myInfoRef.current && String(data.userId) === String(myInfoRef.current.userId)) {
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
  
  // 1. 레디 핸들러 (Logic 1: requestId 포함)
  const handleToggleReady = () => {
    const currentInfo = myInfoRef.current;
    if (!currentInfo) return;
    
    const nextState = !currentInfo.ready;
    console.log("📤 [Send Ready]", nextState);

    websocketClient.publish('ready', { 
      ready: nextState,
      requestId: `req-${Date.now()}` 
    });
  };

  // 2. 강퇴 핸들러 (Design 2: 모달을 통한 확인 후 실행)
  const handleKickConfirm = () => {
    if (!targetKickPlayer) return;
    
    // [Logic 1] 강퇴 요청 시 requestId 포함
    console.log(`📤 [Kick User] Target: ${targetKickPlayer.userId}`);
    websocketClient.publish('kick', { 
      targetUserId: targetKickPlayer.userId,
      requestId: `req-${Date.now()}`
    });
    
    setTargetKickPlayer(null);
  };

  // 3. 방 정보 수정
  const handleUpdateRoom = async (newData) => {
    try {
      if (updateRoomInfo) {
         await updateRoomInfo(roomId, newData);
      }
      setRoomInfo(prev => ({ ...prev, ...newData }));
      setIsSettingsOpen(false);
    } catch (err) {
      console.error("방 정보 수정 실패:", err);
      // UX를 위해 실패해도 로컬 반영 (혹은 에러 표시)
      setRoomInfo(prev => ({ ...prev, ...newData }));
      setIsSettingsOpen(false);
    }
  };

  // 4. 나가기 (Logic 1: requestId 포함)
  const handleExit = () => {
    if (window.confirm("정말 방을 나가시겠습니까?")) {
      try { 
        websocketClient.publish('leave', { requestId: `req-${Date.now()}` }); 
      } catch (e) {}
      websocketClient.disconnect();
      navigate('/rooms');
    }
  };

  // UI 토글 핸들러
  const handleToggleMic = () => setIsMicOn(!isMicOn);
  const handleToggleVideo = () => setIsVideoOn(!isVideoOn);
  const handleCountdownComplete = () => console.log("Countdown finished!");


  // --- 렌더링 (Design 2 구조 따름) ---
  if (!roomInfo || !myInfo) {
    return <LoadingPage message="대기방에 입장 중입니다..." />;
  }

  const amIHost = myInfo.userId === roomInfo.hostUserId;
  const amIReady = myInfo.ready === true; // Logic 1: boolean 안전 변환

  const formattedPlayers = players.map(p => ({
    userId: p.userId,
    name: p.nickname || p.displayName,
    isHost: p.userId === roomInfo.hostUserId,
    isReady: p.ready,
    isMicOn: p.userId === myInfo.userId ? isMicOn : false,
    isVideoOn: p.userId === myInfo.userId ? isVideoOn : true,
    photo: p.profileImage,
  }));

  if (countdown !== null) {
    return <GameStartCountdown count={countdown} onComplete={handleCountdownComplete} />;
  }

  return (
    <div className="fixed inset-0 z-[100] w-full h-screen overflow-hidden bg-black text-white selection:bg-orange-500/30">

      {/* 배경 */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0f]">
        <img
          src="/assets/images/waitingroom/bg_main.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 w-full flex items-center justify-center pt-4 pb-1 px-12">
        <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_10px_rgba(255,100,0,0.5)] tracking-tighter truncate max-w-2xl min-w-[200px] text-center pr-4">
          {roomInfo.title}
        </h1>

        {/* [Design 2] 방장에게만 설정 버튼 표시 */}
        {amIHost && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute right-8 top-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all border border-white/5 hover:border-orange-500/50"
          >
            <Settings size={20} />
          </button>
        )}
      </header>

      {/* 메인 (Design 2: WaitingGrid 직접 사용) */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-0">
        <WaitingGrid
          players={formattedPlayers}
          myId={myInfo.userId}
          isHost={amIHost}
          onKick={setTargetKickPlayer} // 클릭 시 모달 State 변경
          capacity={roomInfo.capacity}
        />
      </main>

      {/* 컨트롤 바 (Design 2 스타일) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0a0a0f]/95 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-2xl">
        <button onClick={handleToggleMic} className={`p-2.5 rounded-full transition-all border ${isMicOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={handleToggleVideo} className={`p-2.5 rounded-full transition-all border ${isVideoOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <div className="w-[1px] h-8 bg-white/10 mx-1" />
        
        {/* 레디 버튼 (Logic 1의 핸들러 연결) */}
        <button
          onClick={handleToggleReady}
          className={`group relative px-8 py-2.5 rounded-full font-black text-lg italic tracking-wider transition-all duration-300 overflow-hidden shadow-lg min-w-[140px] flex items-center justify-center border-2
            ${amIReady 
              ? 'bg-[#ff8a00] border-[#ff8a00] text-white shadow-[0_0_20px_rgba(255,138,0,0.5)] hover:bg-[#e67e00]' 
              : 'bg-white border-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]'
            }`}
        >
          <span className="relative z-10">{amIReady ? "CANCEL" : "READY"}</span>
          {amIReady && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
        </button>

        <div className="w-[1px] h-8 bg-white/10 mx-1" />
        <button onClick={handleExit} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 transition-all text-white/70">
          <LogOut size={20} />
        </button>
      </div>

      {/* 모달 */}
      {isSettingsOpen && (
        <CreateGameModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialData={roomInfo}
          isEdit={true}
          isHost={amIHost}
          inviteCode={roomInfo.inviteCode}
          onSave={handleUpdateRoom}
        />
      )}
      {targetKickPlayer && (
        <LastBeggingModal
          isOpen={!!targetKickPlayer}
          onClose={() => setTargetKickPlayer(null)}
          onConfirm={handleKickConfirm}
          message={`${targetKickPlayer.name}님을\n강제 퇴장하시겠습니까?`}
        />
      )}
      {errorMsg && (
        <GameAlertModal
          isOpen={!!errorMsg}
          onClose={() => setErrorMsg(null)}
          message={errorMsg}
        />
      )}
    </div>
  );
};

export default WaitingRoomPage;