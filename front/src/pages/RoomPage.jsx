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

  // 1. 현재 페이지 상태 관리 (기본값 1)
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10; // 전체 페이지 수

  const handleQuickJoin = () => {
    const mockRoomId = 'r_quick_123';
    console.log('빠른 입장 시도 중...');
    navigate(`/rooms/${mockRoomId}`);
  };

  const handleJoinRoom = (roomId) => {
    console.log(`방 번호 ${roomId} 입장 시도 중...`);
    
    // 나중에 백엔드 연동 시: 여기서 API 호출 후 성공하면 navigate 실행
    // 현재 (Mock): 바로 WaitingRoomPage로 이동
    navigate(`/rooms/${roomId}`, { 
      state: { 
        isHost: false, // 생성된 방에 들어가는 것이므로 일반 유저
      } 
    });
  };

  // 2. 페이지 이동 함수들
  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1)); // 1보다 작아지지 않게
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages)); // totalPages보다 커지지 않게
  };

  const handleSelect = (pageNumber) => {
    setCurrentPage(pageNumber);
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
          <div className="h-auto self-start flex flex-col rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 p-5 overflow-hidden shadow-2xl">
            {/* 1. 내부 콘텐츠를 감싸는 컨테이너에 mx-auto와 max-w를 주어 중앙 정렬 */}
            <div className="w-full max-w-[1000px] mx-auto flex flex-col min-h-0 overflow-hidden">
              
              {/* 2. grid 영역: pt-8로 JOIN 배지 공간 확보 */}
              <div className="grid grid-cols-3 gap-4 pt-4 px-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {Array.from({ length: 6 }).map((_, idx) => {
                  // 전체 순번 계산: (현재페이지 - 1) * 페이지당 개수 + (현재 인덱스 + 1)
                  const roomNumber = (currentPage - 1) * 6 + (idx + 1);
                  
                  // 숫자를 '001' 형식으로 포맷팅
                  const formattedNumber = String(roomNumber).padStart(3, '0');
                  const roomId = `room_${formattedNumber}`; // 고유 ID 시뮬레이션
                  
                  return (
                    <RoomCard
                      key={`${currentPage}-${idx}`}
                      roomCode={`ROOM-${formattedNumber}`} // ROOM-001, ROOM-002... 순차적 표시
                      title={`${currentPage}페이지 방 ${idx + 1}`}
                      hostName="SSAFY 407팀 화이팅"
                      current={5}
                      capacity={8}
                      onJoin={() => handleJoinRoom(roomId)}
                    />
                  );
                })}
              </div>

              {/* 3. 페이지네이션: 이제 p-14가 없으므로 화면 하단에 정상 노출됩니다 */}
              <div className="shrink-0 flex justify-center pt-4 pb-2">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPrev={handlePrev} 
                onNext={handleNext} 
                onSelect={handleSelect} 
              />
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
