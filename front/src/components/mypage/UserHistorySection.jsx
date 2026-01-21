import { useState } from 'react';
import ModifyBtn from './ModifyBtn';
import GameHistoryTable from './GameHistoryTable'; 
import LastBeggingModal from '../modals/LastBeggingModal';

const UserHistorySection = () => {
  const [nickname, setNickname] = useState("유저");
  const [isEditing, setIsEditing] = useState(false);
  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);

  const handleQuitConfirm = () => {
    console.log("회원 탈퇴 처리 로직 실행");
    setIsQuitModalOpen(false);
  };

  const handleEditClick = () => {
    if (isEditing) console.log("저장됨:", nickname);
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex flex-col w-full text-left">
      {/* 닉네임 영역 */}
      <div className="flex items-center gap-3 mb-2 h-[48px]">
        {isEditing ? (
          <input 
            className="bg-[#1a1a1a] text-white border-b-2 border-[#ff8a00] outline-none text-2xl px-2 py-1 h-full"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        ) : (
          <span className="bg-[#2a2a2a] text-gray-300 px-2 py-1 rounded-md text-2xl font-medium border-b-2 border-transparent inline-block">
            {nickname}
          </span>
        )}
        <ModifyBtn isEditing={isEditing} onClick={handleEditClick} />
      </div>

      {/* 실명 영역 */}
      <h2 className="text-3xl font-extrabold text-white mt-2 mb-6 text-left">조채연</h2>

      {/* 전적 테이블 영역 */}
      <div className="flex flex-col items-start w-full">
        <h3 className="text-[#ff8a00] text-2xl font-black mb-3">전적</h3>
        <GameHistoryTable /> {/* 여기서 기존 부품을 호출! */}
      </div>

      <div className="mt-5 w-full text-right">
        <button onClick={() => setIsQuitModalOpen(true)} className="text-orange-100/40 text-sm cursor-pointer hover:text-orange-100 transition-all">
          회원탈퇴
        </button>
      </div>
      
      {/* 회원 탈퇴 확인 모달 */}
      {isQuitModalOpen && (
        <LastBeggingModal 
          isOpen={isQuitModalOpen}
          onClose={() => setIsQuitModalOpen(false)}
          onConfirm={handleQuitConfirm}
          message={`채연입니다님\n탈퇴하시겠습니까?`}
        />
      )}

    </div>
  );
};

export default UserHistorySection;