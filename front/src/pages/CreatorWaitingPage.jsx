import { useState } from 'react';
import WaitingLayout from '../components/waiting/WaitingLayout';
import WaitingGrid from '../components/waiting/WaitingGrid';
import WaitingSidebar from '../components/waiting/WaitingSidebar';
import LastBeggingModal from '../components/modals/LastBeggingModal';
import GameStartCountdown from '../components/waiting/GameStartCountdown';

const CreatorWaitingPage = ({ roomData, updateRoomData, onGameStart } ) => {
  const [targetPlayer, setTargetPlayer] = useState(null);

  // 강퇴 확인 버튼 클릭 시 진행
  const handleKickConfirm = () => {
    if (!targetPlayer) return;

    // 💡 부모에게 명단 업데이트 요청 (해당 ID만 제외)
    const updatedPlayers = roomData.players.filter(p => p.userId !== targetPlayer.id);
    updateRoomData({ players: updatedPlayers });

    setTargetPlayer(null); // 모달 닫기
    console.log(`${targetPlayer.name}님을 퇴장시켰습니다.`);
  };

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
        isHost={true}
        capacity={roomData.capacity}
        onKick={(player) => setTargetPlayer(player)} //슬롯에서 버튼 누르면 실행 
      />
      
      {/* 오른쪽: 사이드바 (isHost=true 전달) */}
      <WaitingSidebar 
        roomInfo={{
          title: roomData.title,
          capacity: roomData.capacity,
          inviteCode: roomData.inviteCode
        }} 
        isHost={true}
        onUpdate={updateRoomData} 
      />

      {/* 전원 레디 시 카운트다운 표시 */}
      {allReady && <GameStartCountdown onComplete={onGameStart} />}  

      {/* 공통 모달 사용 */}
      {targetPlayer && (
        <LastBeggingModal
          isOpen={!!targetPlayer}
          onClose={() => setTargetPlayer(null)}
          onConfirm={handleKickConfirm}
          message={`${targetPlayer.name}님을\n퇴장시키겠습니까?`}
        />
      )}

    </WaitingLayout>
  );
};

export default CreatorWaitingPage;