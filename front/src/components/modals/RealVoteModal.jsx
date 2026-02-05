import { useState } from 'react';
import TimeLine from '../game/TimeLine';

const RealVote = ({ accusedPlayer, onVoteComplete, onVote }) => {
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (decision) => {
    if (hasVoted) return;

    const agree = decision === 'YES';
    console.log(`${accusedPlayer?.nickname} 처형 찬반: ${decision}`);
    setHasVoted(true);

    // 외부에서 전달받은 투표 핸들러 호출 (WebSocket 전송)
    if (onVote) {
      onVote(agree);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-4xl px-10 flex flex-col items-center text-center">
        {/* 상단 타이틀 */}
        <h1 className="text-6xl font-black text-red-600 mb-12 tracking-widest drop-shadow-lg">
          FINAL VOTE
        </h1>
         피고인 정보 (2-2 PlayerState 활용)
        <div className="mb-10">
          // 임시 이미지 삭제
          {/*<div className="w-48 h-48 mx-auto rounded-full border-4 border-[#ff8a00] overflow-hidden mb-6 shadow-[0_0_30px_rgba(255,138,0,0.3)]">*/}
          {/*  <img */}
          {/*    src={accusedPlayer?.photo || "/assets/dog_character.png"} */}
          {/*    className="w-full h-full object-cover"*/}
          {/*    alt="accused" */}
          {/*  />*/}
          {/*</div>*/}
          <h2 className="text-4xl text-white font-bold leading-tight">
            <span className="text-primary">{accusedPlayer?.nickname}</span>님을 <br/>
            <span className="text-3xl text-gray-300">처형하시겠습니까?</span>
          </h2>
        </div>

        {/* 투표 버튼 (2-5 YesNo Enum 기반) */}
        <div className="flex gap-8 w-full max-w-2xl mb-20">
          <button 
            disabled={hasVoted}
            onClick={() => handleVote('YES')}
            className={`flex-1 py-6 rounded-xl text-3xl font-black transition-all transform active:scale-95
              ${hasVoted 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                : "bg-orange-600 text-white hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(234,88,12,0.5)]"
              }`}
          >
            {hasVoted ? "대기 중" : "찬 성"}
          </button>
          <button 
            disabled={hasVoted}
            onClick={() => handleVote('NO')}
            className={`flex-1 py-6 rounded-xl text-3xl font-black transition-all transform active:scale-95
              ${hasVoted 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                : "bg-gray-600 text-white hover:bg-gray-500"
              }`}
          >
            {hasVoted ? "대기 중" : "반 대"}
          </button>
        </div>

        {/* 2초 타임라인 */}
        <div className="w-full max-w-2xl">
          <TimeLine duration={5} onTimeout={onVoteComplete} />
        </div>
      </div>
    </div>
  );
};

export default RealVote;