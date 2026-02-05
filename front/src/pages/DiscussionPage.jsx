import TimeLine from '../components/game/TimeLine';
import GameVideoSlot from '../components/game/GameVideoSlot'

const DiscussionPage = ({ roomSession, getTrack, myUserId, onTimeout }) => {
  // 1. 백엔드 설계(2-3-3)의 TrialState에서 피고인 정보 추출
  const { accusedUserId, finalVote } = roomSession.gameState?.trial || {};

  // 2. Map 형태이거나 배열인 플레이어 데이터를 배열로 변환
  const players = Array.isArray(roomSession.players) 
    ? roomSession.players 
    : Object.values(roomSession.players); 

  // 피고인(accused)과 나머지 생존자 분리
  const accusedPlayer = players.find(p => p.userId === accusedUserId) || players[0]; 
  const otherPlayers = players.filter(p => p.userId !== accusedUserId && p.isAlive);
  
  return (
   <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden pb-6">
      <div className="h-20 flex-none" />

      {/* 메인 섹션 */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center min-h-0 px-4">
        {accusedPlayer ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6">

            <div className="relative w-full aspect-video max-h-[55vh] rounded-2xl overflow-hidden border-2 border-primary/50">
              <GameVideoSlot
                player={accusedPlayer}
                isMe={String(accusedPlayer.userId) === String(myUserId)}
                track={getTrack ? getTrack(accusedPlayer) : undefined}
                canVote={false}
                size="big"

              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white text-xl italic opacity-30 font-light font-mono">
            피고인을 찾을 수 없습니다.
          </div>
        )}
      </div>

      {/* 👥 하단 섹션: 나머지 생존 플레이어들 (방청객 느낌) */}
      <div className="h-[160px] w-full flex-none flex items-center justify-center px-10 mt-2">
        <div className="flex gap-4 w-full justify-center overflow-hidden">
          {otherPlayers.map(player => (
            <div key={player.userId} className="w-40 aspect-video flex-shrink-0 transition-all hover:scale-105 duration-300">
              <GameVideoSlot
                player={player}
                isMe={String(player.userId) === String(myUserId)}
                track={getTrack ? getTrack(player) : undefined}
                canVote={false}
                size="small"
              />
            </div>
          ))}
        </div>
      </div>
      {/* ⏳ 하단 독립 타임라인 (변론 시간 안내) */}
      {/* <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72">
        <TimeLine duration={10} onTimeout={onTimeout} />
      </div> */}

      {/* 🪓 처형 연출 오버레이 (백엔드 4.2 VOTE2_RESULT approved: true일 때) */}
      {finalVote?.result === 'EXECUTE' && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-red-900/80 backdrop-blur-md animate-bloodScreen">
          <h1 className="text-7xl font-black text-white italic shadow-2xl">EXECUTED</h1>
        </div>
      )}
    </div>
  );
};

export default DiscussionPage;