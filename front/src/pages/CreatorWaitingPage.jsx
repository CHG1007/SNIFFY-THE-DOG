import React, { useState } from 'react';
import WaitingGrid from '../components/waiting/WaitingGrid';
import WaitingSidebar from '../components/waiting/WaitingSidebar';
import LastBeggingModal from '../components/modals/LastBeggingModal';

const CreatorWaitingPage = ({ 
  roomInfo, 
  players, 
  myId, 
  onKick,    // 부모에게서 받은 강퇴 함수
  onUpdate   // 부모에게서 받은 방 수정 함수
}) => {
  const [targetPlayer, setTargetPlayer] = useState(null);

  const handleKickConfirm = () => {
    if (targetPlayer) {
      onKick(targetPlayer.userId); // 부모 함수 호출 (소켓 전송)
      setTargetPlayer(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-row items-start justify-center gap-6 pt-4 px-12 relative">
      
      {/* 1. 플레이어 그리드 (왼쪽) */}
      <div className="flex-1 h-full min-w-0">
        <WaitingGrid 
          players={players} 
          myId={myId} 
          isHost={true} 
          capacity={roomInfo.capacity} 
          onKick={setTargetPlayer} // 킥 아이콘 클릭 시 로컬 상태 변경 -> 모달 오픈
        />
      </div>

      {/* 2. 사이드바 (오른쪽) */}
      <div className="w-[320px] h-fit shrink-0">
        <WaitingSidebar 
          roomInfo={roomInfo} 
          isHost={true}
          onUpdate={onUpdate} 
        />
      </div>

      {/* 3. 강퇴 확인 모달 */}
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