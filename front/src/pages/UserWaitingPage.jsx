import React from 'react';
import { Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react'; // 아이콘 import 추가
import WaitingGrid from '../components/waiting/WaitingGrid';

const UserWaitingPage = ({ 
  players, 
  myId, 
  capacity,
  amIReady,
  isMicOn,
  isVideoOn,
  onToggleMic,
  onToggleVideo,
  onReady,
  onExit
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-4 px-12">
      {/* 1. 메인 플레이어 그리드 */}
      <div className="w-full max-w-[1200px] h-full">
        <WaitingGrid 
          players={players} 
          myId={myId} 
          isHost={false} 
          capacity={capacity} 
        />
      </div>

      {/* 2. 하단 컨트롤 바 (본인이 작업한 디자인을 팀원 로직 props와 연결) */}
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
    </div>
  );
};

export default UserWaitingPage;