import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FindGameModal from '../components/modals/FindGameModal';
import CreateGameModal from '../components/modals/CreateGameModal';

import LeftPanel from "../components/room/LeftPanel";
import LobbyLayout from '../components/room/LobbyLayout';
import TopMenu from '../components/room/TopMenu';
import RoomCard from '../components/room/RoomCard';
import Pagination from '../components/room/Pagination';

const RoomPage = () => {
  const navigate = useNavigate();
  const [isFindGameOpen, setIsFindGameOpen] = useState(false);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);

  const handleQuickJoin = () => {
    const mockRoomId = 'r_quick_123';
    console.log('빠른 입장 시도 중...');
    navigate(`/rooms/${mockRoomId}`);
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
            <TopMenu label="게임시작" onClick={handleQuickJoin} />
          </>
        }
        leftPanel={<LeftPanel />}
        mainPanel={
          <div className="h-fit max-h-[90%] self-center flex flex-col rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 p-6 overflow-hidden shadow-2xl">
            {/* 1. 내부 콘텐츠를 감싸는 컨테이너에 mx-auto와 max-w를 주어 중앙 정렬 */}
            <div className="w-full max-w-[1000px] mx-auto flex flex-col min-h-0">
              
              {/* 2. grid 영역: pt-8로 JOIN 배지 공간 확보 */}
              <div className="grid grid-cols-3 gap-6 overflow-y-auto pt-4 px-4 custom-scrollbar content-start">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <RoomCard
                    key={idx}
                    roomCode="ROOM-001"
                    title="입장하세요"
                    hostName="SSAFY 407팀 화이팅"
                    current={5}
                    capacity={8}
                  />
                ))}
              </div>

              {/* 3. 페이지네이션: 이제 p-14가 없으므로 화면 하단에 정상 노출됩니다 */}
              <div className="shrink-0 flex justify-center pt-4 pb-2">
                <Pagination currentPage={1} totalPages={3} onPrev={() => {}} onNext={() => {}} onSelect={() => {}} />
              </div>
            </div>
          </div>
        }
      >
        <FindGameModal isOpen={isFindGameOpen} onClose={() => setIsFindGameOpen(false)} />
        {isCreateGameOpen && (
          <CreateGameModal isOpen={isCreateGameOpen} onClose={() => setIsCreateGameOpen(false)} />
        )}
      </LobbyLayout>
    </div>
  );
};

export default RoomPage;
