// 1. useEffect를 반드시 임포트해야 합니다.
import { useState, useEffect } from 'react'; 
import GameVideoSlot from '../components/game/GameVideoSlot';
import TimeScreen from '../components/game/TimeScreen';

const GamePage = ({ players = [], myId }) => {
  // 게임 단계 관리
  const [gameStep, setGameStep] = useState("DAY"); 
  
  // 이중 타이머 상태
  const [totalSeconds, setTotalSeconds] = useState(0); 
  const [phaseSeconds, setPhaseSeconds] = useState(2); 

  // 각 라운드마다 투표 했었는지 안 했었는지 확인
  const [didIVote, setDidIVote] = useState(false);

  // 시간 포맷 변환 함수
  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  const getFlexBasis = () => {
    const count = players.length;
    if (count <= 4) return "basis-[calc(50%-1rem)]";
    if (count <= 6) return "basis-[calc(33.33%-1rem)]";
    return "basis-[calc(25%-1rem)]"; 
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds(prev => prev + 1);
      
      setPhaseSeconds(prev => {
        if (prev > 1) {
          return prev - 1;
        } else {
          // 시간이 0이 되는 순간 단계를 전환하며 투표 상태도 초기화합니다.
          setGameStep(currentStep => {
            setDidIVote(false); // ✨ 단계가 바뀔 때 여기서 투표권을 초기화 (에러 해결 핵심)
            
            if (currentStep === "DAY") {
              setPhaseSeconds(4); 
              return "VOTE";
            } else if (currentStep === "VOTE") {
              setPhaseSeconds(5);
              return "NIGHT";
            } else if (currentStep === "NIGHT") {
              setPhaseSeconds(6);
              return "DAY";
            }
            return currentStep;
          });
          return 0; 
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[#0a0a0f] flex flex-col overflow-hidden relative">
      
      <main className="flex-1 relative p-6 flex items-center justify-center overflow-hidden">
        
        {/* 수정: timeLeft에 formatTime(totalSeconds)를 넣어야 시계가 흘러갑니다. */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
          <TimeScreen timeLeft={formatTime(totalSeconds)} gameStatus={gameStep} />
        </div>

        <div className="flex flex-wrap justify-center content-center gap-6 w-full max-w-[1600px] h-full transition-all duration-700 overflow-hidden">
          {players.map((player) => (
            <div 
              key={`${gameStep}-${player.id}`}
              className={`
                ${getFlexBasis()} 
                transition-all duration-500 
                aspect-video 
                max-h-[40vh] 
                min-w-[280px]
              `}
            >
              <GameVideoSlot 
                player={player} 
                isMe={player.id === myId}
                canVote={gameStep === "VOTE"}
                phaseSeconds={phaseSeconds}
                didIVote={didIVote}
                onVoteComplete={() => setDidIVote(true)}
              />
            </div>
          ))}
        </div>
      </main>

      <div className={`
        absolute inset-0 pointer-events-none transition-colors duration-1000 -z-10
        ${gameStep === "NIGHT" 
          ? "bg-gradient-to-b from-blue-900/30 via-transparent to-[#0a0a0f]" 
          : "bg-gradient-to-b from-orange-900/20 via-transparent to-[#0a0a0f]"
        }
      `} />

      <div className="absolute inset-0 pointer-events-none bg-[url('/assets/fog.png')] opacity-20 mix-blend-overlay -z-10 animate-pulse" />
    </div>
  );
};

export default GamePage;