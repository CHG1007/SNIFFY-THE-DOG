import WaitingLayout from '../components/waiting/WaitingLayout';
import WaitingGrid from '../components/waiting/WaitingGrid';
import WaitingSidebar from '../components/waiting/WaitingSidebar';

const CreatorWaitingPage = ({ roomData } ) => {
  
  return (
    <WaitingLayout title={roomData.title}>
      {/* 왼쪽: 플레이어 그리드 */}
      <WaitingGrid 
        players={roomData.players.map(p => ({
          id: p.userId,
          name: p.displayName,
          isReady: p.ready
        }))} 
        myId={1} 
      />
      
      {/* 오른쪽: 사이드바 (isHost=true 전달) */}
      <WaitingSidebar 
        roomInfo={{
          title: roomData.title,
          capacity: roomData.capacity,
          inviteCode: roomData.inviteCode
        }} 
        isHost={true} 
      />
    </WaitingLayout>
  );
};

export default CreatorWaitingPage;