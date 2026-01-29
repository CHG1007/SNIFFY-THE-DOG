import { useState, useEffect, useMemo } from 'react';
import GameVideoSlot from '../components/game/GameVideoSlot';
import TimeScreen from '../components/game/TimeScreen';
import DiscussionPage from './DiscussionPage';
import RealVote from '../components/modals/RealVoteModal';
import GameAlertModal from '../components/modals/GameAlertModal';
import VoteConfirmModal from '../components/modals/VoteConfirmModal';
import NothingHappenModal from '../components/modals/NothingHappenModal';


// 초 단위를 "00:00" 형식으로 바꿔주는 유틸리티 함수
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const GamePage = ({ players = [], myId }) => {
  const [gameStep, setGameStep] = useState("DAY");
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [phaseSeconds, setPhaseSeconds] = useState(0);
  const [didIVote, setDidIVote] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);

  // 1. 데이터 표준화(프론트-백엔드 구조 일치)
  const standardizedPlayers = useMemo(() => players.map(p => ({
    userId: p.userId, 
    nickname: p.nickname || p.displayName || p.name,
    isHost: p.isHost || false,
    isAlive: p.isAlive ?? p.alive ?? true, 
    gameRole: p.role || p.gameRole || 'CITIZEN',
    stream: p.stream || null,
    photo: p.photo || ""
  })), [players]);

  // 생존자 및 마피아 수 계산
  const alivePlayers = standardizedPlayers.filter(p => p.isAlive);
  const mafiaCount = alivePlayers.filter(p => p.gameRole === 'MAFIA').length;
  const citizenCount = alivePlayers.length - mafiaCount;

  const mockRoomSession = {
   gameState: { 
      trial: {
        accusedUserId: standardizedPlayers[0]?.userId || 1,
        finalVote: { votes: {}, result: null }
      }
    },
    players: standardizedPlayers
  };

  // [시간을 재는 역할] 1초마다 숫자를 올리기만 합니다.
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds(prev => prev + 1);
      setPhaseSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  // [단계를 바꾸는 역할] phaseSeconds가 목표치에 도달했는지 계속 감시합니다.
  useEffect(() => {
    const handlePhaseChange = () => {
      // 1. 낮 대화 -> 1차 투표
      if (gameStep === "DAY" && phaseSeconds >= 10) {
        setGameStep("DAY_VOTE"); setPhaseSeconds(0); setDidIVote(false);
      } 
      // 2. 1차 투표 -> 투표 결과 발표 (모달 등장)
      else if (gameStep === "DAY_VOTE" && phaseSeconds >= 10) {
        setGameStep("VOTE_RESULT"); setPhaseSeconds(0);
      } 
      // 3. 결과 발표(5초) -> 최후 변론 (DiscussionPage 등장)
      else if (gameStep === "VOTE_RESULT" && phaseSeconds >= 5) {
        setGameStep("DEFENSE"); setPhaseSeconds(0);
      } 
      // 4. 최후 변론 -> 찬반 투표 (RealVote 모달 등장)
      else if (gameStep === "DEFENSE" && phaseSeconds >= 10) {
        setGameStep("FINAL_VOTE"); setPhaseSeconds(0);
      } 
      // 5. 찬반 투표(5초) -> 최종 결과 발표 (모달 등장)
      else if (gameStep === "FINAL_VOTE" && phaseSeconds >= 5) {
        setGameStep("FINAL_RESULT"); setPhaseSeconds(0);
      } 
      // 6. 최종 결과(5초) -> 밤
      else if (gameStep === "FINAL_RESULT" && phaseSeconds >= 5) {
        setGameStep("NIGHT"); setPhaseSeconds(0);
      } 
      // 7. 밤(20초) -> 다시 낮 (하루 루프 끝)
      else if (gameStep === "NIGHT" && phaseSeconds >= 20) {
        setGameStep("DAY"); setPhaseSeconds(0);
      }
    };

    handlePhaseChange();
  }, [phaseSeconds, gameStep]); // phaseSeconds가 1초씩 오를 때마다 실행되어 조건을 체크함

  // [승패를 감시하는 역할] 인원수 데이터가 변할 때만 체크합니다.
  useEffect(() => {
    if (mafiaCount === 0) {
      console.log("시민 승리 조건 충족!");
    } else if (mafiaCount >= citizenCount) {
      console.log("마피아 승리 조건 충족!");
    }
  }, [mafiaCount, citizenCount]); // 인원수가 바뀔 때만 실행됨 (최적화)

  // 인원 수 계산
  const getFlexBasis = (capacity) => {
    if (capacity <= 4) return "basis-[calc(50%-1.5rem)]";
    if (capacity <= 6) return "basis-[calc(33.33%-1.5rem)]";
    return "basis-[calc(25%-1.5rem)]"; // 7~8명일 때 4열 배치
  };

  const capacity = standardizedPlayers.length; // 현재 인원수

  const handleVoteClick = (player) => {
    setSelectedPlayer(player); // 클릭한 유저 객체를 그대로 저장 (userId, nickname 등 포함)
    setIsVoteModalOpen(true);
  };

  const handleVoteConfirm = () => {
  if (didIVote || !selectedPlayer) return; // 혹시 모를 중복 실행 방지

  console.log(`${selectedPlayer.nickname}님에게 최종 투표!`);
  
  // 투표 완료 상태로 변경 (이게 변하면 모든 Slot의 버튼이 DONE으로 바뀜)
  setDidIVote(true); 
  
  // 확인 모달 닫기
  setIsVoteModalOpen(false); 

  // 백엔드 통신 로직 예정 (selectedPlayer.userId 사용)
};

  return (
   <div className="h-[calc(100vh-60px)] w-full bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100]">
        <TimeScreen timeLeft={formatTime(totalSeconds)} gameStatus={gameStep} />
      </div>

      <main className="flex-1 w-full h-full max-w-[1800px] mx-auto relative flex flex-col">
        {gameStep === "DEFENSE" ? (
          <div className="w-full h-full"> 
          <DiscussionPage roomSession={mockRoomSession} onTimeout={() => {}} />
        </div>
        ) : (
         <div className="flex flex-wrap justify-center content-center gap-6 w-full h-full max-h-[85vh] pt-24">
            {standardizedPlayers.map((player) => (
              <div 
                key={player.userId} 
                className={`flex-grow-0 flex-shrink-0 ${getFlexBasis(capacity)} min-w-[320px] transition-all duration-500`}
              >
              <div className="w-full h-full aspect-video"> 
                  <GameVideoSlot 
                    player={player}
                    isMe={player.userId === myId} 
                    canVote={gameStep === "DAY_VOTE"}
                    didIVote={didIVote}
                    onVoteRequest={() => handleVoteClick(player)}
                    size="normal" 
                  />
              </div>
            </div>
            ))}
          </div>
        )}

        {/* --- 모달 시스템 (z-index 확인) --- */}

        {/* 1단계: 낮 투표 확인 모달 (사용자 클릭 시 발생) */}
        <VoteConfirmModal 
          isOpen={isVoteModalOpen}
          targetName={selectedPlayer?.nickname} // 선택된 유저의 닉네임 전달
          phaseSeconds={phaseSeconds}
          onClose={() => setIsVoteModalOpen(false)}
          onConfirm={handleVoteConfirm}
        />
        {/* 2단계: 결과 안내 모달 (gameStep에 따라 자동 발생) */}
        {gameStep === "VOTE_RESULT" && (
          <GameAlertModal 
            title="VOTE RESULT"
            targetPlayer={standardizedPlayers[0]}
            message="피고인으로 지목되었습니다."
          />
        )}

        {gameStep === "FINAL_VOTE" && (
          <RealVote accusedPlayer={standardizedPlayers[0]} onVoteComplete={() => {}} />
        )}

        {gameStep === "FINAL_RESULT" && (
          <GameAlertModal 
            title="VERDICT"
            targetPlayer={standardizedPlayers[0]}
            message="찬반 투표 결과 처형되었습니다."
          />
        )}
        {/* 3단계: 아무 일도 없었을 때 (필요시) */}
      {/* {gameStep === "NO_EVENT" && <NothingHappenModal onTimeout={...} />} */}
      </main>
      <div className={`absolute inset-0 -z-10 transition-colors duration-1000 ${gameStep === "NIGHT" ? "bg-blue-900/10" : "bg-orange-900/10"}`} />
    </div>
  );
};

export default GamePage;