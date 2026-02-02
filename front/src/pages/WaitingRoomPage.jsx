import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react';
import LoadingPage from './LoadingPage';
import GamePage from './GamePage';
import WaitingGrid from '../components/waiting/WaitingGrid';
import CreateGameModal from '../components/modals/CreateGameModal';
import LastBeggingModal from '../components/modals/LastBeggingModal';
import GameStartCountdown from '../components/waiting/GameStartCountdown';

const WaitingRoomPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('WAITING');
  const [roomData, setRoomData] = useState(null);
  
  // Local UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [targetKickPlayer, setTargetKickPlayer] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Check Host
  const amIHost = location.state?.isHost || false;
  const myId = amIHost ? 1 : 2; // Simulation ID

 // 1. 데이터 가져오는 로직 (단 하나만 유지)
  useEffect(() => {
    let isMounted = true; // 언마운트 시 상태 업데이트 방지

    const fetchInitialData = async () => {
      // 실제로는 여기서 API를 호출합니다.
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (isMounted) {
        const initialData = {
          roomId,
          title: location.state?.createdData?.title || "죽음의 마피아 게임",
          hostUserId: 1,
          capacity: location.state?.createdData?.capacity || 8,
          inviteCode: location.state?.createdData?.inviteCode || "X9Z2A1",
          isPrivate: location.state?.createdData?.isPrivate || false,
          players: [
            { userId: 1, displayName: "유저001", isHost: true, ready: false, isMicOn: true, isVideoOn: true },
            { userId: 2, displayName: "시민1", isHost: false, ready: false, isMicOn: false, isVideoOn: true },
            { userId: 3, displayName: "경찰", isHost: false, ready: true, isMicOn: true, isVideoOn: false },
            { userId: 4, displayName: "의사", isHost: false, ready: false, isMicOn: false, isVideoOn: false },
            { userId: 5, displayName: "유저101", isHost: false, ready: true, isMicOn: true, isVideoOn: true },
            { userId: 6, displayName: "유저100", isHost: false, ready: true, isMicOn: true, isVideoOn: true },
          ]
        };
        setRoomData(initialData);
      }
    };

    fetchInitialData();
    return () => { isMounted = false; }; // Cleanup 함수
  }, [roomId, location.state]);
  
  // --- Handlers ---

  const handleUpdateRoom = (newData) => {
    setRoomData(prev => ({ ...prev, ...newData }));
    setIsSettingsOpen(false);
  };

  const handleKick = () => {
  if (!targetKickPlayer) return;

  setRoomData(prev => {
    // 1. 해당 플레이어 제외
    const newPlayers = prev.players.filter(p => p.userId !== targetKickPlayer.userId);
    
    // 2. 남은 인원 체크
    const allReady = newPlayers.length >= 2 && newPlayers.every(p => p.ready);
    if (allReady) {
      setStatus('STARTING');
    }

    return { ...prev, players: newPlayers };
  });

  setTargetKickPlayer(null);
};

  // 2번 useEffect는 삭제하고, 핸들러를 수정합니다.
  const handleReady = () => {
  setRoomData(prev => {
    // 1. 새로운 플레이어 목록 계산
    const newPlayers = prev.players.map(p => 
      p.userId === myId ? { ...p, ready: !p.ready } : p
    );
    
    // 2. 새로운 목록을 바탕으로 시작 조건 체크
    const allReady = newPlayers.length >= 2 && newPlayers.every(p => p.ready);
    
    // 3. 조건 만족 시 상태 변경 (함수 실행 도중 호출해도 안전합니다)
    if (allReady) {
      setStatus('STARTING');
    }

    // 4. 업데이트된 객체 반환
    return { ...prev, players: newPlayers };
    });
  };


  const handleToggleMic = () => {
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    setRoomData(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.userId === myId ? { ...p, isMicOn: newMicState } : p
      )
    }));
  };

  const handleToggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    setRoomData(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.userId === myId ? { ...p, isVideoOn: newVideoState } : p
      )
    }));
  };

  const handleCountdownComplete = () => {
     setStatus('PLAYING');
  };

  const handleExit = () => {
    navigate('/rooms');
  };

  // --- Render Conditions ---

  if (!roomData) return <LoadingPage />; 
  if (status === 'STARTING') return <GameStartCountdown onComplete={handleCountdownComplete} />; 
  if (status === 'PLAYING') return <GamePage players={roomData.players.map(p => ({ id: p.userId, name: p.displayName, ready: p.ready }))} myId={myId} />; 

  const myPlayer = roomData.players.find(p => p.userId === myId);
  const amIReady = myPlayer?.ready || false;

  return (
    // [FEATURE A: Global Header Removal Hack] 
    // fixed inset-0 z-[100] keeps the header hidden
    <div className="fixed inset-0 z-[100] w-full h-screen overflow-hidden bg-black text-white selection:bg-orange-500/30">

      {/* 1. Background Image */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0f]">
        <img
            src="/assets/images/waitingroom/bg_main.png"
            alt="Background"
            className="w-full h-full object-cover"
        />

        {/* Overlay Adjusted (lighter) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </div>

      {/* 2. Header */}
      <header className="relative z-10 w-full flex items-center justify-center pt-4 pb-1 px-12">
        {/* Title - Fixed Clipping with pr-4 */}
        <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_10px_rgba(255,100,0,0.5)] tracking-tighter truncate max-w-2xl min-w-[200px] text-center pr-4">
          {roomData.title}
        </h1>

        {/* Settings Button (Host & Guest Visible) */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="absolute right-8 top-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all border border-white/5 hover:border-orange-500/50"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* 3. Main Content: Video Grid */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-0">
         <WaitingGrid 
            players={roomData.players} 
            myId={myId} 
            isHost={amIHost} 
            onKick={setTargetKickPlayer}
            capacity={roomData.capacity} 
         />
      </main>

      {/* 4. Bottom Control Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0a0a0f]/95 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-2xl">
        
        {/* Mic Toggle */}
        <button 
          onClick={handleToggleMic}
          className={`p-2.5 rounded-full transition-all border ${isMicOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Video Toggle */}
        <button 
          onClick={handleToggleVideo}
          className={`p-2.5 rounded-full transition-all border ${isVideoOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}
        >
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <div className="w-[1px] h-8 bg-white/10 mx-1" />

        {/* READY Button */}
        <button
          onClick={handleReady}
          className={`
            group relative px-8 py-2.5 rounded-full font-black text-lg italic tracking-wider transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] min-w-[140px] flex items-center justify-center
            ${amIReady 
              ? 'bg-transparent text-gray-400 border border-white/10 hover:bg-white/5' 
              : 'bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]'
            }
          `}
        >
          <span className="relative z-10">
             {amIReady ? "CANCEL" : "READY"}
          </span>
          {!amIReady && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />}
        </button>

        <div className="w-[1px] h-8 bg-white/10 mx-1" />

        {/* Exit Button */}
        <button 
          onClick={handleExit}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 transition-all text-white/70"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Modals */}
      {isSettingsOpen && (
        <CreateGameModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          initialData={{ title: roomData.title, capacity: roomData.capacity, isPrivate: roomData.isPrivate }}
          isEdit={true}
          isHost={amIHost}
          inviteCode={roomData.inviteCode}
          onSave={handleUpdateRoom}
        />
      )}

      {targetKickPlayer && (
        <LastBeggingModal
          isOpen={!!targetKickPlayer}
          onClose={() => setTargetKickPlayer(null)}
          onConfirm={handleKick}
          message={`${targetKickPlayer.name}님을\n강제 퇴장하시겠습니까?`}
        />
      )}

    </div>
  );
};

export default WaitingRoomPage;