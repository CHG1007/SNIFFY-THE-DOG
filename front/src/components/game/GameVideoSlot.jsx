import { useState, useEffect } from 'react';
import VideoCanvas from "../video/VideoCanvas";
import VoteConfirmModal from "../modals/VoteConfirmModal";

const GameVideoSlot = ({ player, isMe, canVote, didIVote, onVoteRequest, size = "normal" }) => {
  const [audioLevel, setAudioLevel] = useState(0);

  // 사이즈별 스타일 정의
  const isBig = size === "big";
  const isSmall = size === "small";

  // 마이크 애니메이션 (나중에 실제 WebRTC 오디오와 연결)
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 100));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative w-full h-full bg-[#1a1a1a] rounded-xl overflow-hidden border-2 transition-all duration-500
      ${player.isAlive ? (isBig ? 'border-[#ff8a00] border-4 shadow-[0_0_50px_rgba(255,138,0,0.3)]' : 'border-white/5') : 'border-red-900/50 grayscale opacity-60'} 
      group`}>
      {/* 비디오 캔버스 */}
      <div className="w-full h-full">
        <VideoCanvas stream={player.stream} isMuted={isMe} photo={player.photo}/>
      </div>

      {/* 투표 버튼 레이어 */}
      {canVote && player.isAlive && !isMe && (
        <div className={`absolute ${isSmall ? 'top-1 right-1' : 'top-3 right-3'} z-50`}>
          <button 
            onClick={onVoteRequest}
            disabled={didIVote} 
            className={`rounded-full border-2 transition-all shadow-lg flex items-center justify-center
              ${isSmall ? 'w-8 h-8' : 'w-12 h-12'}
              ${didIVote 
                ? "bg-gray-800/80 border-gray-600 cursor-not-allowed" 
                : "bg-black/60 border-[#ff8a00] hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(255,138,0,0.3)]"
              }`}
          >
            <span className={`font-black italic ${isSmall ? 'text-[8px]' : 'text-[10px]'} ${didIVote ? "text-gray-400" : "text-[#ff8a00]"}`}>
              {didIVote ? "DONE" : "VOTE"} 
            </span>
          </button>
        </div>
      )}

      {/* 정보 오버레이 (하단) */}
      <div className={`absolute ${isSmall ? 'bottom-1 left-1 right-1' : 'bottom-2 left-2 right-2'} z-20 flex justify-between items-end`}>
          <div className="flex flex-col gap-1">
            <span className={`bg-black/60 px-2 py-0.5 rounded text-white w-fit ${isSmall ? 'text-[9px]' : isBig ? 'text-sm font-bold' : 'text-xs'}`}>
              {player.nickname} {isMe && "(나)"} {!player.isAlive && "💀"}
            </span>
          </div>
        
        {/* 오디오 레벨 바 */}
        <div className={`flex items-end gap-[2px] ${isSmall ? 'h-2 mb-0.5' : isBig ? 'h-5 mb-1' : 'h-4 mb-1'}`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-1 bg-[#ff8a00] transition-all duration-150"
              style={{ height: `${Math.max(10, audioLevel * (i * 0.2))}%` }}
            />
          ))}
        </div>
      </div>

      {/* 방장 표시 (🐾) */}
      {player.isHost && (
        <div className="absolute top-3 left-3 z-10 drop-shadow-md">
          <span className="text-xl">🐾</span>
        </div>
      )}
    </div>
  );
};

export default GameVideoSlot;