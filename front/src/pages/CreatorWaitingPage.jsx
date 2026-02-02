import React, { useState } from 'react';
import { Settings, Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react';

// Components
import WaitingGrid from '../components/waiting/WaitingGrid';
import CreateGameModal from '../components/modals/CreateGameModal';
import LastBeggingModal from '../components/modals/LastBeggingModal';

const CreatorWaitingPage = ({
  roomInfo,
  players,
  myInfo,
  amIReady,
  isMicOn,
  isVideoOn,
  onToggleMic,
  onToggleVideo,
  onReady,
  onExit,
  onKick,
  onUpdate
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [targetKickPlayer, setTargetKickPlayer] = useState(null);

  // 플레이어 데이터 가공
  const formattedPlayers = players.map(p => ({
    userId: p.userId,
    name: p.nickname || p.displayName,
    isHost: p.userId === roomInfo.hostUserId,
    isReady: p.ready,
    isMicOn: p.userId === myInfo.userId ? isMicOn : false,
    isVideoOn: p.userId === myInfo.userId ? isVideoOn : true,
    photo: p.profileImage,
  }));

  const handleKickConfirm = () => {
    if (targetKickPlayer) {
      onKick(targetKickPlayer.userId);
      setTargetKickPlayer(null);
    }
  };

  const handleUpdateAndClose = (data) => {
    onUpdate(data);
    setIsSettingsOpen(false);
  };

  return (
    <>
      {/* 헤더 (설정 버튼 있음) */}
      <header className="relative z-10 w-full flex items-center justify-center pt-4 pb-1 px-12">
        <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_10px_rgba(255,100,0,0.5)] tracking-tighter truncate max-w-2xl min-w-[200px] text-center pr-4">
          {roomInfo.title}
        </h1>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="absolute right-8 top-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all border border-white/5 hover:border-orange-500/50"
        >
          <Settings size={20} />
        </button>
      </header>
      {/* 메인 콘텐츠 (킥 가능) */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-0">
        <WaitingGrid 
          players={formattedPlayers} 
          myId={myInfo.userId} 
          isHost={true} 
          onKick={setTargetKickPlayer} 
          capacity={roomInfo.capacity} 
        />
      </main>

      {/* 하단 컨트롤 바 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0a0a0f]/95 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-2xl">
        <button onClick={onToggleMic} className={`p-2.5 rounded-full transition-all border ${isMicOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={onToggleVideo} className={`p-2.5 rounded-full transition-all border ${isVideoOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <div className="w-[1px] h-8 bg-white/10 mx-1" />
        <button
          onClick={onReady}
          className={`group relative px-8 py-2.5 rounded-full font-black text-lg italic tracking-wider transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] min-w-[140px] flex items-center justify-center ${amIReady ? 'bg-transparent text-gray-400 border border-white/10 hover:bg-white/5' : 'bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]'}`}
        >
          <span className="relative z-10">{amIReady ? "CANCEL" : "READY"}</span>
          {!amIReady && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />}
        </button>
        <div className="w-[1px] h-8 bg-white/10 mx-1" />
        <button onClick={onExit} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 transition-all text-white/70">
          <LogOut size={20} />
        </button>
      </div>

      {/* 방장 전용 모달 */}
      {isSettingsOpen && (
        <CreateGameModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          initialData={{ 
            title: roomInfo.title, 
            capacity: roomInfo.capacity, 
            isPrivate: roomInfo.isPrivate 
          }}
          isEdit={true}
          isHost={true}
          inviteCode={roomInfo.inviteCode}
          onSave={handleUpdateAndClose}
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
    </>
  );
};

export default CreatorWaitingPage;