import WaitingLayout from '../components/waiting/WaitingLayout';
import WaitingGrid from '../components/waiting/WaitingGrid';

// props 변경: onGameStart -> onReady, myId 추가
const UserWaitingPage = ({ roomData, onReady, myId }) => {
  
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
        myId={myId} // ✅ 내 ID 전달
        capacity={roomData.capacity}
        onReady={onReady} // ✅ 레디 버튼 핸들러 (WaitingGrid -> ReadyBtn으로 전달됨)
      />
      
      {/* 카운트다운 로직은 상위(WaitingRoomPage)에서 전역으로 처리하므로 삭제함 */}
    </WaitingLayout>
  );
};

export default UserWaitingPage;