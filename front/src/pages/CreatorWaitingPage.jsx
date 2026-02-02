import React, { useState } from 'react';
import WaitingGrid from '../components/waiting/WaitingGrid';
import LastBeggingModal from '../components/modals/LastBeggingModal';

const CreatorWaitingPage = ({ 
  roomInfo, 
  players, 
  myId, 
  onKick,    // 부모(WaitingRoomPage)에서 전달받은 강퇴 함수
  onUpdate   
}) => {
  const [targetPlayer, setTargetPlayer] = useState(null);

  const handleKickConfirm = () => {
    if (targetPlayer) {
      console.log(`[Creator] Confirm Kick: ${targetPlayer.userId}`);
      onKick(targetPlayer.userId); // 강퇴 요청 전송
      setTargetPlayer(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-4 px-12 relative">
      
      {/* 1. 플레이어 그리드 */}
      <div className="w-full max-w-[1200px] h-full">
        <WaitingGrid 
          players={players} 
          myId={myId} 
          isHost={true} 
          capacity={roomInfo.capacity} 
          onKick={setTargetPlayer} // 그리드의 강퇴 버튼 클릭 시 모달 Open
        />
      </div>

      {/* 2. 강퇴 확인 모달 */}
      {targetPlayer && (
        <LastBeggingModal
          isOpen={!!targetPlayer}
          onClose={() => setTargetPlayer(null)}
          onConfirm={handleKickConfirm}
          message={`${targetPlayer.name}님을\n강제 퇴장하시겠습니까?`}
        />
      )}
    </div>
  );
};

export default CreatorWaitingPage;