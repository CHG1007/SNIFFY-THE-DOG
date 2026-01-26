import { useState } from 'react';
import GameVideoSlot from '../components/game/GameVideoSlot';
import TimeScreen from '../components/game/TimeScreen';

const GamePage = ({ players = [], myId, gameStatus = "DAY" }) => {
  const [timeLeft, setTimeLeft] = useState("01:19");

  // 게임 단계 관리
  const [gameStep, setGameStep] = useState("DAY"); // DAY, VOTE, NIGHT
  
  // 이중 타이머 상태
  const [totalSeconds, setTotalSeconds] = useState(0); // 상단 전광판용 (누적)
  const [phaseSeconds, setPhaseSeconds] = useState(60); // 모달 카운트다운용 (60s -> 10s -> 30s)


  // [추가] 타이머 엔진 로직
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds(prev => prev + 1);
      setPhaseSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // [추가] 단계 자동 전환 로직
  useEffect(() => {
    if (phaseSeconds === 0) {
      if (gameStep === "DAY") {
        setGameStep("VOTE");
        setPhaseSeconds(10); // 투표 시간 10초
      } else if (gameStep === "VOTE") {
        setGameStep("NIGHT");
        setPhaseSeconds(30); // 밤 시간 30초
      } else if (gameStep === "NIGHT") {
        setGameStep("DAY");
        setPhaseSeconds(60); // 다시 낮 60초
      }
    }
  }, [phaseSeconds, gameStep]);

  // [추가] 시간 포맷 변환 함수 (00:00)
  const formatTime = (s) => {
    const min = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  // 인원수에 따른 동적 너비 계산 (대기방 로직 계승)
  const getFlexBasis = () => {
    const count = players.length;
    if (count <= 4) return "basis-[calc(50%-1rem)]";
    if (count <= 6) return "basis-[calc(33.33%-1rem)]";
    return "basis-[calc(25%-1rem)]"; 
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[#0a0a0f] flex flex-col overflow-hidden relative">
      
      {/* 메인 게임 영역 */}
      <main className="flex-1 relative p-6 flex items-center justify-center overflow-hidden">
        
        {/* 상단 중앙 타이머: z-50으로 최상단 배치 */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
          <TimeScreen timeLeft={timeLeft} gameStatus={gameStep} />
        </div>

        {/* 비디오 그리드: h-full과 overflow-hidden으로 내부 스크롤 차단 */}
        <div className="flex flex-wrap justify-center content-center gap-6 w-full max-w-[1600px] h-full transition-all duration-700 overflow-hidden">
          {players.map((player) => (
            <div 
              key={player.id} 
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
              />
            </div>
          ))}
        </div>
      </main>

      {/* 배경 무드 조명: inset-0으로 꽉 채우기 */}
      <div className={`
        absolute inset-0 pointer-events-none transition-colors duration-1000 -z-10
        ${gameStep === "NIGHT" 
          ? "bg-gradient-to-b from-blue-900/30 via-transparent to-[#0a0a0f]" 
          : "bg-gradient-to-b from-orange-900/20 via-transparent to-[#0a0a0f]"
        }
      `} />

      {/* 장식용 안개 효과 */}
      <div className="absolute inset-0 pointer-events-none bg-[url('/assets/fog.png')] opacity-20 mix-blend-overlay -z-10 animate-pulse" />
    </div>
  );
};

export default GamePage;