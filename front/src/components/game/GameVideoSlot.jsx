import { useState, useEffect } from 'react';
import VideoCanvas from "../video/VideoCanvas";
import VoteConfirmModal from "../modals/VoteConfirmModal";

const GameVideoSlot = ({ player, isMe, canVote, didIVote, onVoteComplete }) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🚩 [삭제] const [hasVoted, setHasVoted] = useState(false); 
  // 슬롯마다 따로 노는 상태 대신 부모가 준 didIVote를 사용해야 전원이 동시에 변합니다.

  // 마이크 애니메이션 (나중에 실제 WebRTC 오디오와 연결)
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 100));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // 복수 투표 방지 핸들러
  const handleVoteClick = () => {
    if (!player.isAlive) return; 
    if (didIVote) return; 
    setIsModalOpen(true);
  };

  const handleVoteConfirm = () => {
    console.log(`${player.name}님에게 투표 완료!`);
    onVoteComplete(player.userId); // 🚩 부모의 didIVote를 true로 바꿈 (모든 자식에게 전파)
    setIsModalOpen(false);
  };

  return (
    <div className={`relative w-full h-full min-h-58 bg-[#1a1a1a] rounded-xl overflow-hidden border-2 transition-all duration-500
      ${player.isAlive ? 'border-white/5' : 'border-red-900/50 grayscale opacity-60'} 
      shadow-inner group`}>
      {/* 비디오 캔버스 */}
      <div className="w-full h-full">
        <VideoCanvas stream={player.stream} isMuted={isMe} photo={player.photo}/>
      </div>

      {/* 투표 버튼 레이어 */}
      {canVote && player.isAlive && !isMe && (
        <div className="absolute top-3 right-3 z-50">
          <button 
            onClick={handleVoteClick}
            disabled={didIVote} 
            className={`w-12 h-12 rounded-full border-2 transition-all shadow-lg
              ${didIVote 
                ? "bg-gray-800/80 border-gray-600 cursor-not-allowed" 
                : "bg-black/60 border-[#ff8a00] hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(255,138,0,0.3)]"
              }`}
          >
            <span className={`text-[10px] font-black italic ${didIVote ? "text-gray-400" : "text-[#ff8a00]"}`}>
              {didIVote ? "DONE" : "VOTE"} 
            </span>
          </button>
        </div>
      )}

      {/* 정보 오버레이 (하단) */}
      <div className="absolute bottom-2 left-2 right-2 z-20 flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <span className="bg-black/60 px-2 py-0.5 rounded text-xs text-white w-fit">
              {player.nickname} {isMe && "(나)"} {!player.isAlive && "💀"}
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

      {/* 투표 확인 모달 */}
      <VoteConfirmModal 
        isOpen={isModalOpen}
        targetName={player.name}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleVoteConfirm}
      />
    </div>
  );
};

export default GameVideoSlot;