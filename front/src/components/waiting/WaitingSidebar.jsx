import { useState } from 'react';
import CreateGameModal from '../modals/CreateGameModal'; // 모달 임포트 경로 확인!

const WaitingSidebar = ({ roomInfo, isHost }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ✅ 이 위치에 넣어주세요!
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomInfo.inviteCode);
      alert("초대 코드가 복사되었습니다!");
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  return (
    <div className="w-80 bg-[#1a1a1a]/90 p-6 rounded-2xl flex flex-col gap-6 self-start border border-white/5 shadow-2xl">
      {/* 방 제목 섹션 */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-bold text-sm">방 제목</span>
          {isHost && (
            <button 
              onClick={() => setIsEditModalOpen(true)} // 수정 클릭 시 모달 열기
              className="text-[10px] bg-orange-600 px-2 py-0.5 rounded text-white hover:bg-orange-500 cursor-pointer"
            >
              수정
            </button>
          )}
        </div>
        <div className="text-white text-lg font-medium border-b border-orange-500/50 pb-1 italic">
          {roomInfo.title}
        </div>
      </div>

      {/* 인원 수 섹션 */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-bold text-sm">총 인원수</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-orange-500 w-7 h-7 flex items-center justify-center rounded-md text-white font-bold shadow-lg">
            {roomInfo.capacity}
          </span>
        </div>
      </div>

      {/* 초대 코드 섹션 */}
      <div className="flex flex-col gap-2">
        <span className="text-gray-400 font-bold text-sm">초대 코드</span>
        <div className="bg-black/50 p-3 rounded-xl border border-orange-500/30 text-white flex justify-between items-center group hover:border-orange-500 transition-colors">
          <span className="font-mono tracking-wider">{roomInfo.inviteCode}</span>
          <button 
            onClick={handleCopyCode} // ✅ 복사 함수 연결
            className="text-gray-500 hover:text-orange-500 transition-colors cursor-pointer"
          >
            📋
          </button>
        </div>
      </div>

      {/* 방 정보 수정 모달 */}
      {isEditModalOpen && (
        <CreateGameModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          initialData={roomInfo} // 기존 데이터 전달
          isEdit={true}           // 수정 모드 표시
        />
      )}
    </div>
  );
};

export default WaitingSidebar;