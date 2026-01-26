import WaitingLayout from '../components/waiting/WaitingLayout';
import WaitingGrid from '../components/waiting/WaitingGrid';
import GameStartCountdown from '../components/waiting/GameStartCountdown';

const UserWaitingPage = ({ roomData, onGameStart }) => {
  
  // 전원 레디 체크 (최소 인원 6명 이상 + 본인 포함 전원 ready)
  const allReady = roomData.players.length >= 6 && roomData.players.every(p => p.ready); 
  
  return (
    <WaitingLayout title={roomData.title}>
      {/* 왼쪽: 플레이어 그리드 */}
      <WaitingGrid 
        players={roomData.players.map(p => ({
          id: p.userId,
          name: p.displayName,
          isReady: p.ready,
          isHost: p.isHost
        }))} 
        myId={1} 
        capacity={roomData.capacity}
      />
      {allReady && <GameStartCountdown onComplete={onGameStart} />}
    </WaitingLayout>
  );
};

export default UserWaitingPage;