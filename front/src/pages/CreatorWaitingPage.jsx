import { useState } from 'react';
import WaitingLayout from '../components/waiting/WaitingLayout';
import WaitingGrid from '../components/waiting/WaitingGrid';
import WaitingSidebar from '../components/waiting/WaitingSidebar';
import LastBeggingModal from '../components/modals/LastBeggingModal';

// props에 myId, onKick 추가됨
const CreatorWaitingPage = ({ roomData, updateRoomData, onGameStart, onKick, myId }) => {
  const [targetPlayer, setTargetPlayer] = useState(null);

  // 강퇴 확인 버튼 클릭 시 진행
  const handleKickConfirm = () => {
    if (!targetPlayer) return;

    // ✅ 로컬 배열 조작 대신 서버로 강퇴 요청 전송
    onKick(targetPlayer.id);

    setTargetPlayer(null); // 모달 닫기
    console.log(`${targetPlayer.name}님 강퇴 요청`);
  };

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
        myId={myId}   // ✅ 내 ID 전달
        isHost={true} // 방장 모드
        capacity={roomData.capacity}
        onKick={(player) => setTargetPlayer(player)} // 슬롯에서 킥 버튼 누르면 타겟 설정
      />
      
      {/* 오른쪽: 사이드바 */}
      <WaitingSidebar 
        roomInfo={{
          title: roomData.title,
          capacity: roomData.capacity,
          inviteCode: roomData.inviteCode
        }} 
        isHost={true}
        onUpdate={updateRoomData} 
      />

      {/* ✅ 방장 전용: 게임 시작 버튼 */}
      <div className="absolute bottom-10 right-10 z-50">
        <button 
          onClick={onGameStart}
          className="bg-[#ff8a00] text-white font-black text-2xl px-8 py-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all border-2 border-white/20 cursor-pointer"
        >
          GAME START
        </button>
      </div>

      {/* 강퇴 확인 모달 */}
      <LastBeggingModal 
        isOpen={!!targetPlayer}
        onClose={() => setTargetPlayer(null)}
        onKick={handleKickConfirm}
        playerName={targetPlayer?.name}
      />
    </WaitingLayout>
  );
};

export default CreatorWaitingPage;