import { useState, useEffect } from 'react';
import VideoCanvas from "../video/VideoCanvas";

const GameVideoSlot = ({ player, isMe, canVote, phaseSeconds }) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [showVoteModal, setShowVoteModal] = useState(false);

  // 마이크 애니메이션 (나중에 실제 WebRTC 오디오와 연결)
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 100));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[180px] bg-[#1a1a1a] rounded-xl overflow-hidden border-2 border-white/5 shadow-inner group">
      {/* 비디오 캔버스 */}
      <VideoCanvas stream={player.stream} isMuted={isMe} />

      {/* 투표 버튼 레이어 */}
      {canVote && !isMe && (
        <div className="absolute top-3 right-3 z-50">
          <button 
            onClick={() => setShowVoteModal(true)}
            className="w-12 h-12 bg-black/60 border-2 border-[#ff8a00] rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_15px_rgba(255,138,0,0.3)]"
          >
            <span className="text-[10px] text-[#ff8a00] font-black italic">VOTE</span>
          </button>
        </div>
      )}


      {/* 정보 오버레이 (하단) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <span className="text-white text-sm font-bold bg-black/40 px-2 py-0.5 rounded">
            {player.name} {isMe && "(나)"}
          </span>
        </div>
        
        {/* 오디오 레벨 바 */}
        <div className="flex items-end gap-[2px] h-4 mb-1">
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

      {/* 투표 확인 모달 (추가) */}
      {showVoteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-[#111115] p-8 rounded-2xl border-2 border-[#ff8a00] text-center max-w-sm w-full mx-4">
            <h3 className="text-white text-xl font-bold mb-2">
              <span className="text-[#ff8a00]">{player.name}</span>님에게<br/>투표하시겠습니까?
            </h3>
            <p className="text-red-500 text-sm font-bold mb-8 animate-pulse">
              결정까지 {phaseSeconds}초 남았습니다!
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowVoteModal(false)} className="flex-1 py-3 bg-white/5 text-white rounded-xl font-bold">취소</button>
              <button onClick={() => { console.log("투표!"); setShowVoteModal(false); }} className="flex-1 py-3 bg-[#ff8a00] text-black rounded-xl font-bold">투표하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameVideoSlot;