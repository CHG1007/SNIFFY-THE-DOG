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
    <div className="w-full overflow-hidden">
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
          <div className="flex-1 rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 p-4 flex flex-col">
            <div className="grid grid-cols-3 gap-6 flex-1">
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
            <Pagination currentPage={1} totalPages={3} onPrev={() => {}} onNext={() => {}} onSelect={() => {}} />
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
