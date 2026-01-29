import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FindGameModal from '../components/modals/FindGameModal'; 
import CreateGameModal from '../components/modals/CreateGameModal';

const RoomPage = () => {
  const navigate = useNavigate();
  // 로직: 모달의 열림/닫힘 상태를 관리 (초기값은 false)
  const [isFindGameOpen, setIsFindGameOpen] = useState(false);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);

  const handleQuickJoin = () => {
    // 실제로는 API(3-2) 호출: POST /api/v1/rooms/quick-join
    const mockRoomId = "r_quick_123";
    console.log("빠른 입장 시도 중...");
    navigate(`/rooms/${mockRoomId}`); // 유저 대기방 경로로 이동
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-6 relative">
      {/* 화상 테스트 버튼 */}
      <button
        onClick={() => navigate('/video-test')}
        className="absolute top-4 right-4 px-3 py-1.5 bg-white/5 text-white/60 text-xs rounded-lg hover:bg-white/10 hover:text-white transition-all"
      >
        화상 테스트
      </button>

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

        <button onClick={handleQuickJoin} 
        className="px-8 py-4 bg-[#ff8a00] text-white rounded-xl font-bold hover:bg-[#ffaa44] transition-all cursor-pointer">
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