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

  // ✅ 최신 상태 참조를 위한 Ref
  const myInfoRef = useRef(myInfo);
  const locationRef = useRef(location);

  // ✅ [초기화] 방 생성 직후라면 location state 정보를 우선 사용
  useEffect(() => {
    const state = location.state || {};
    const created = state.createdData;
    
    if (created) {
      setRoomInfo({
        title: created.title,
        capacity: created.capacity,
        isPrivate: created.isPrivate,
        inviteCode: state.inviteCode,
        status: created.isPrivate ? 'PRIVATE' : 'WAITING',
        hostUserId: null
      });
    }
  }, [location.state]);

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
      case 'ROOM_SNAPSHOT': // ✅ JOIN_ACK와 SNAPSHOT 로직 통합 관리
        const rs = data.roomState;
        
        setPlayers(rs.players);
        setMyInfo(data.my);

        // --- 방 정보 동기화 로직 ---
        // 1. 서버에서 받은 데이터(rs)를 최우선으로 사용
        // 2. 서버 데이터가 비어있다면(그럴리 없지만), 로컬 state(createdData)나 기존 roomInfo 사용
        // 3. 그래도 없으면 기본값 사용
        
        const localCreated = locationRef.current.state?.createdData;
        const localInviteCode = locationRef.current.state?.inviteCode;
        
        // 서버에서 title/capacity가 오면 그것을 쓰고, 없으면 로컬 정보 사용
        const serverTitle = rs.title; // 백엔드 RoomState 수정 후 여기로 값이 들어옴
        const serverCapacity = rs.capacity; 

        // 방 제목 결정
        const finalTitle = serverTitle || localCreated?.title || roomInfo?.title || "즐거운 마피아 게임";
        
        // 방 인원 결정
        const finalCapacity = serverCapacity || localCreated?.capacity || roomInfo?.capacity || 8;
        
        // 초대 코드 결정
        let finalInviteCode = rs.roomCode || rs.inviteCode || roomId;
        // RoomId 객체 문자열 파싱 처리
        if (typeof finalInviteCode === 'string' && finalInviteCode.includes('RoomId[value=')) {
            finalInviteCode = finalInviteCode.replace('RoomId[value=', '').replace(']', '');
        }
        // 로컬에 초대코드가 있고 서버 코드가 이상하면 로컬 우선 (방 생성 직후)
        if (localInviteCode && (!finalInviteCode || finalInviteCode === roomId)) {
            finalInviteCode = localInviteCode;
        }

        const isPrivate = rs.status === 'PRIVATE' || rs.isPrivate || localCreated?.isPrivate || false;

        setRoomInfo({
          title: finalTitle,
          capacity: finalCapacity,
          hostUserId: rs.hostUserId,
          status: rs.status,
          inviteCode: finalInviteCode,
          isPrivate: isPrivate
        });

        // JOIN_ACK 일 때만 sync 호출
        if (type === 'JOIN_ACK') {
           websocketClient.sync();
        }
        
        // 게임 중이면 이동
        if (rs.status === 'PLAYING' && type === 'ROOM_SNAPSHOT') {
          navigate(`/game/${roomId}`, {
            state: { myInfo: data.my, players: rs.players, capacity: finalCapacity }
          });
        }
        break;

      case 'ROOM_PLAYER_JOINED':
        setPlayers((prev) => {
          const newPlayer = data.player;
          if (prev.find(p => String(p.userId) === String(newPlayer.userId))) return prev;
          return [...prev, newPlayer];
        });
        // 누군가 들어왔을 때 혹시 방 정보가 갱신되었다면 반영
        if (data.roomState) {
             setRoomInfo(prev => ({
                 ...prev,
                 // 서버에서 title/capacity 보내준다면 여기서도 갱신 가능
                 hostUserId: data.roomState.hostUserId 
             }));
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
          state: { myInfo: myInfoRef.current, players, capacity: roomInfo?.capacity || 6 }
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
  }, [navigate, roomId, roomInfo]); 


  // --- 소켓 연결 등 기존 로직 유지 ---
  useEffect(() => {
    const onMessage = (msg) => handleSocketMessage(msg);
    websocketClient.connect(roomId, onMessage);

    const handleBeforeUnload = () => {
      try { websocketClient.publish('leave', { requestId: `req-leave-${Date.now()}` }); } catch (e) {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      try { websocketClient.publish('leave', { requestId: `req-leave-${Date.now()}` }); } catch (e) {}
      websocketClient.disconnect();
    };
  }, [roomId]); 

  // --- 핸들러들 (Ready, Kick, Mic, Video...) ---
  const handleToggleReady = () => {
    const currentInfo = myInfoRef.current;
    if (!currentInfo) return;
    const nextState = !currentInfo.ready;
    websocketClient.publish('ready', { ready: nextState, requestId: `req-${Date.now()}` });
  };

  const handleKickConfirm = () => {
    if (!targetKickPlayer) return;
    websocketClient.publish('kick', { targetUserId: targetKickPlayer.userId, requestId: `req-${Date.now()}` });
    setTargetKickPlayer(null);
  };

  const handleUpdateRoom = async (newData) => {
    try {
      if (updateRoomInfo) await updateRoomInfo(roomId, newData);
      setRoomInfo(prev => ({ ...prev, ...newData }));
      setIsSettingsOpen(false);
    } catch (err) {
      console.error("방 정보 수정 실패:", err);
      setRoomInfo(prev => ({ ...prev, ...newData }));
      setIsSettingsOpen(false);
    }
  };

  const handleExit = () => {
    if (window.confirm("정말 방을 나가시겠습니까?")) {
      navigate('/rooms');
    }
  };

  const handleToggleMic = () => setIsMicOn(!isMicOn);
  const handleToggleVideo = () => setIsVideoOn(!isVideoOn);
  const handleCountdownComplete = () => console.log("Countdown finished!");

  // --- 렌더링 ---
  if (!roomInfo || !myInfo) return <LoadingPage message="대기방에 입장 중입니다..." />;

  const amIHost = myInfo.userId === roomInfo.hostUserId;
  const amIReady = myInfo.ready === true;

  const formattedPlayers = players.map(p => ({
    userId: p.userId,
    name: p.nickname || p.displayName,
    displayName: p.nickname || p.displayName,
    isHost: p.userId === roomInfo.hostUserId,
    ready: p.ready,
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
        <img src="/assets/images/waitingroom/bg_main.png" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </div>

      {/* 헤더 (모든 유저가 동일하게 서버에서 받은 roomInfo.title을 봄) */}
      <header className="relative z-50 w-full flex items-center justify-center pt-4 pb-1 px-12">
        <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_10px_rgba(255,100,0,0.5)] tracking-tighter truncate max-w-2xl min-w-[200px] text-center pr-4">
          {roomInfo.title}
        </h1>
        {amIHost && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute right-8 top-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all border border-white/5 hover:border-orange-500/50 cursor-pointer"
          >
            <Settings size={20} />
          </button>
        )}
      </header>

      {/* 메인: WaitingGrid에 서버에서 받은 roomInfo.capacity 전달 */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-0">
        <WaitingGrid
          players={formattedPlayers}
          myId={myInfo.userId}
          isHost={amIHost}
          onKick={setTargetKickPlayer} 
          capacity={roomInfo.capacity} 
        />
      </main>

      {/* 컨트롤 바 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0a0a0f]/95 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-2xl">
        <button onClick={handleToggleMic} className={`p-2.5 rounded-full transition-all border ${isMicOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={handleToggleVideo} className={`p-2.5 rounded-full transition-all border ${isVideoOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <div className="w-[1px] h-8 bg-white/10 mx-1" />
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