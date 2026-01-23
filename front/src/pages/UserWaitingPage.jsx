import WaitingLayout from '../components/waiting/WaitingLayout';
import WaitingGrid from '../components/waiting/WaitingGrid';

const UserWaitingPage = ({ roomData }) => {
  
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
    </WaitingLayout>
  );
};

export default UserWaitingPage;