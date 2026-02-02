import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API
import { quickJoin } from '../api/roomApi'; 

// UI Components
import LeftPanel from "../components/room/LeftPanel";
import LobbyLayout from '../components/room/LobbyLayout';
import TopMenu from '../components/room/TopMenu';
import RoomCard from '../components/room/RoomCard';
import Pagination from '../components/room/Pagination';

// Modals
import FindGameModal from '../components/modals/FindGameModal';
import CreateGameModal from '../components/modals/CreateGameModal';

const RoomPage = () => {
  const navigate = useNavigate();
  
  // 모달 상태 관리
  const [isFindGameOpen, setIsFindGameOpen] = useState(false);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);

  // [Logic Integration] 빠른 입장 핸들러 (Version A의 API 로직 사용)
  const handleQuickJoin = async () => {
    try {
      console.log("빠른 입장 시도 중...");
      const response = await quickJoin();
      // 백엔드 응답 필드에 맞게 처리 (roomId 혹은 roomCode)
      const roomId = response.data?.roomId || response.data?.roomCode;

      if (roomId) {
        navigate(`/waiting-room/${roomId}`);
      } else {
        alert("입장 가능한 방 정보를 받지 못했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("빠른 입장에 실패했습니다. 입장 가능한 방이 없습니다.");
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col">
      <LobbyLayout
        backgroundUrl="/assets/images/roompage/background.png"
        onVideoTest={() => navigate('/video-test')}
        topMenus={
          <>
            <TopMenu label="게임찾기" onClick={() => setIsFindGameOpen(true)} />
            <TopMenu label="게임생성" onClick={() => setIsCreateGameOpen(true)} />
            {/* API 로직이 연결된 핸들러 사용 */}
            <TopMenu label="게임시작" onClick={handleQuickJoin} />
          </>
        }
        leftPanel={<LeftPanel />}
        mainPanel={
          <div className="h-fit max-h-[90%] self-center flex flex-col rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 p-6 overflow-hidden shadow-2xl">
            {/* 내부 콘텐츠 컨테이너 */}
            <div className="w-full max-w-[1000px] mx-auto flex flex-col min-h-0">
              
              {/* 방 목록 그리드 (추후 API로 방 목록 받아와서 map 돌려야 함) */}
              <div className="grid grid-cols-3 gap-6 overflow-y-auto pt-4 px-4 custom-scrollbar content-start">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <RoomCard
                    key={idx}
                    roomCode={`ROOM-${idx + 1}`}
                    title="입장하세요"
                    hostName="SSAFY 407팀"
                    current={5}
                    capacity={8}
                  />
                ))}
              </div>

              {/* 페이지네이션 */}
              <div className="shrink-0 flex justify-center pt-4 pb-2">
                <Pagination currentPage={1} totalPages={3} onPrev={() => {}} onNext={() => {}} onSelect={() => {}} />
              </div>
            </div>
          </div>
        }
      >
        {/* 모달 렌더링 */}
        <FindGameModal isOpen={isFindGameOpen} onClose={() => setIsFindGameOpen(false)} />
        {isCreateGameOpen && (
          <CreateGameModal isOpen={isCreateGameOpen} onClose={() => setIsCreateGameOpen(false)} />
        )}
      </LobbyLayout>
    </div>
  );
};

export default RoomPage;