import { useState } from 'react';
import TimeLine from '../game/TimeLine';

const RealVote = ({ accusedPlayer, onVoteComplete }) => {
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (decision) => {
    // decision: 백엔드 2-5 설계의 YES 또는 NO
    console.log(`${accusedPlayer.displayName} 처형 찬반: ${decision}`);
    setHasVoted(true);
    // 실제로는 여기서 axios.post 등으로 백엔드에 투표 결과를 보냅니다.
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
      <div className="bg-[#0f111a] p-8 rounded-2xl border-2 border-orange-500/50 text-center w-[400px]">
        {/* 피고인 정보 (2-2 PlayerState 활용) */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-full border-2 border-orange-500 overflow-hidden mb-2">
            <img src={accusedPlayer?.photo || "/assets/default.png"} alt="target" />
          </div>
          <h2 className="text-white text-lg font-bold">
            {accusedPlayer?.displayName}님을 처형하시겠습니까?
          </h2>
        </div>

        {/* 투표 버튼 (2-5 YesNo Enum 기반) */}
        <div className="flex gap-4 mb-8">
          <button 
            disabled={hasVoted}
            onClick={() => handleVote('YES')}
            className="flex-1 py-3 bg-orange-600 text-white font-black rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            찬성
          </button>
          <button 
            disabled={hasVoted}
            onClick={() => handleVote('NO')}
            className="flex-1 py-3 bg-gray-700 text-white font-black rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            반대
          </button>
        </div>

        {/* 2초 타임라인 */}
        <TimeLine duration={2} onTimeout={onVoteComplete} />
      </div>
    </div>
  );
};

export default RealVote;