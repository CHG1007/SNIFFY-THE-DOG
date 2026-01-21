import { useState } from 'react';
import FindGameModal from '../components/modals/FindGameModal'; // 위에서 만든 파일 임포트
import CreateGameModal from '../components/modals/CreateGameModal';

const RoomPage = () => {
  // 로직: 모달의 열림/닫힘 상태를 관리 (초기값은 false)
  const [isFindGameOpen, setIsFindGameOpen] = useState(false);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-black text-white mb-10">LOBBY</h1>

      {/* 버튼들 */}
      <div className="flex gap-4">
        {/* 게임 찾기 버튼을 누르면 상태를 true로 변경 */}
        <button 
          onClick={() => setIsFindGameOpen(true)}
          className="px-8 py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all cursor-pointer"
        >
          게임 찾기
        </button>

        <button 
          onClick={() => setIsCreateGameOpen(true)}
          className="px-8 py-4 bg-[#ff8a00] text-white rounded-xl font-bold hover:bg-[#ffaa44] transition-all cursor-pointer"
        >
          게임 생성
        </button>

        <button className="px-8 py-4 bg-[#ff8a00] text-white rounded-xl font-bold hover:bg-[#ffaa44] transition-all cursor-pointer">
          게임 시작
        </button>
      </div>

      {/* 모달 컴포넌트 배치 */}
      {/* isOpen: 현재 상태 전달 / onClose: 상태를 다시 false로 바꾸는 함수 전달 */}
      <FindGameModal 
        isOpen={isFindGameOpen} 
        onClose={() => setIsFindGameOpen(false)} 
      />
      {/* 게임 생성 모달 */}
      {isCreateGameOpen && (
        <CreateGameModal 
          isOpen={isCreateGameOpen} 
          onClose={() => setIsCreateGameOpen(false)} 
        />
      )}

    </div>
  );
};

export default RoomPage;