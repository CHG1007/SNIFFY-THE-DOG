import TimeLine from '../components/game/TimeLine';
import GameVideoSlot from '../components/game/GameVideoSlot'

const DiscussionPage = ({ roomSession, onTimeout }) => {
  // 1. 백엔드 설계(2-3-3)의 TrialState에서 피고인 정보 추출
  const { accusedUserId, finalVote } = roomSession.gameState?.trial || {};
  
  // 2. Map 형태이거나 배열인 플레이어 데이터를 배열로 변환
  const players = Array.isArray(roomSession.players) 
    ? roomSession.players 
    : Object.values(roomSession.players); 

  // 피고인(accused)과 나머지 생존자 분리
  const accusedPlayer = players.find(p => p.userId === accusedUserId);
  const otherPlayers = players.filter(p => p.userId !== accusedUserId && p.isAlive);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* 메인: 피고인(accusedPlayer) 강조 UI */}
      {accusedPlayer ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-4xl animate-fadeIn">
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-[#ff8a00] shadow-[0_0_50px_rgba(255,138,0,0.3)]">
            <GameVideoSlot 
              player={accusedPlayer} 
              isMe={false} // 최후 변론 중엔 투표 버튼이 필요 없으므로 false
              canVote={false} 
            />
            {/* 상단 라벨 */}
            <div className="absolute top-0 left-0 right-0 bg-[#ff8a00] text-black font-black text-center py-2 text-sm tracking-widest">
              DEFENSE: {accusedPlayer.nickname}
            </div>
          </div>

          {/* 📊 실시간 찬반 투표 현황 (백엔드 2-3-4 FinalVoteState 연동) */}
          <div className="flex gap-10 bg-black/40 px-6 py-2 rounded-full border border-white/10">
            <div className="text-white text-xl font-bold">
              찬성: <span className="text-orange-500">{Object.values(finalVote?.votes || {}).filter(v => v === 'YES').length}</span>
            </div>
            <div className="text-white text-xl font-bold">
              반대: <span className="text-gray-400">{Object.values(finalVote?.votes || {}).filter(v => v === 'NO').length}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-white text-xl italic opacity-50">피고인을 찾을 수 없습니다.</div>
      )}

      {/* 👥 하단 섹션: 나머지 생존 플레이어들 (방청객 느낌) */}
      <div className="flex gap-4 mt-10 w-full justify-center px-4 overflow-x-hidden">
        {otherPlayers.map(player => (
          <div key={player.userId} className="w-40 aspect-video rounded-lg overflow-hidden border border-white/10 opacity-50 grayscale hover:grayscale-0 transition-all">
            <GameVideoSlot player={player} isMe={false} canVote={false} />
          </div>
        ))}
      </div>

      {/* ⏳ 하단 독립 타임라인 (변론 시간 안내) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64">
        <TimeLine duration={10} onTimeout={onTimeout} />
      </div>

      {/* 🪓 처형 연출 오버레이 (백엔드 4.2 VOTE2_RESULT approved: true일 때) */}
      {finalVote?.result === 'EXECUTE' && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-red-900/80 backdrop-blur-md animate-bloodScreen">
          <h1 className="text-7xl font-black text-white italic">EXECUTED</h1>
        </div>
      )}
    </div>
  );
};

export default DiscussionPage;