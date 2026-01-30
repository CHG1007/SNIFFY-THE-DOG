import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quickJoin } from '../api/roomApi'; // ✅ API import
import FindGameModal from '../components/modals/FindGameModal'; 
import CreateGameModal from '../components/modals/CreateGameModal';

const RoomPage = () => {
  const navigate = useNavigate();
  const [isFindGameOpen, setIsFindGameOpen] = useState(false);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);

  const handleQuickJoin = async () => {
    try {
      console.log("빠른 입장 시도 중...");
      // ✅ 실제 API 호출
      const response = await quickJoin();
      const roomId = response.data?.roomId || response.data?.roomCode;

      if (roomId) {
        navigate(`/waiting-room/${roomId}`);
      }
    } catch (error) {
      console.error(error);
      alert("빠른 입장에 실패했습니다. 입장 가능한 방이 없습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-black text-white mb-10">LOBBY</h1>

      {/* 버튼들 */}
      <div className="flex gap-4">
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

        <button 
          onClick={handleQuickJoin} 
          className="px-8 py-4 bg-[#ff8a00] text-white rounded-xl font-bold hover:bg-[#ffaa44] transition-all cursor-pointer"
        >
          게임 시작
        </button>
      </div>

      {/* 모달 컴포넌트 */}
      <FindGameModal 
        isOpen={isFindGameOpen} 
        onClose={() => setIsFindGameOpen(false)} 
      />
      
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