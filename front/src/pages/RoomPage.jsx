import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API
import { quickJoin, getRoomList, getRoomDetail } from '../api/roomApi';
import { useRoomEntry } from '../hooks/useRoomEntry';
import { useEffect } from 'react';
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
  const { enterRoom } = useRoomEntry();

  // 상태 관리
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // 한 페이지당 6개 (현재 그리드 기준)

  // 모달 상태 관리
  const [isFindGameOpen, setIsFindGameOpen] = useState(false);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);

  // 1. 현재 페이지 상태 관리 (기본값 1)
  const totalPages = 10; // 전체 페이지 수

 // [Logic Integration] 빠른 입장 핸들러 (Version A의 API 로직 사용)
const handleQuickJoin = async () => {
    try {
    console.log("빠른 입장 시도 중...");
    const response = await quickJoin();
    // 백엔드 응답 필드에 맞게 처리 (roomId 혹은 roomCode)

     const roomId = response.data?.roomId || response.data?.roomCode;

    if (roomId) {
        navigate(`/rooms/${roomId}`);
    } else {
        alert("입장 가능한 방 정보를 받지 못했습니다.");
    }
    } catch (error) {
    console.error(error);
    alert("빠른 입장에 실패했습니다. 입장 가능한 방이 없습니다.");
    }
};



 
const fetchRooms = async (page) => {
    try {
        setIsLoading(true);
        // 백엔드는 0-based page 사용
        const response = await getRoomList(page - 1, pageSize);
        if (response.success) {
            setRooms(response.data || []);
        }
    } catch (error) {
        console.error("방 목록 로딩 실패:", error);
    } finally {
        setIsLoading(false);
    }
};

useEffect(() => {
        fetchRooms(currentPage);
        }, [currentPage]);
    


// 방 직접 입장 핸들러
const handleJoinRoom = async (room) => {
    try {
    // 입장 가능 앱 상태 체크 (REST - RoomId 사용)
    const response = await getRoomDetail(room.roomId);
    if (response.success && response.data.status === 'WAITING') {
        enterRoom(room.roomId, false);
    } else {
        alert("이미 게임이 진행 중이거나 입장이 불가한 방입니다.");
        fetchRooms(currentPage); // 목록 갱신
    }
    } catch (error) {
    console.error("입장 실패:", error);
    alert("방 입장에 실패했습니다.");
    }
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
        {/* API 로직이 연결된 핸들러 사용 */}
        <TopMenu label="게임시작" onClick={handleQuickJoin} />
      </>
    }
    leftPanel={<LeftPanel />}
    mainPanel={
      <div className="w-full max-w-[1050px] h-[60vh] min-h-[465px] max-h-[550px] self-start flex flex-col rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 p-5 overflow-hidden shadow-2xl">
        {/* 내부 콘텐츠 컨테이너 */}
        <div className="w-full max-w-[1000px] mx-auto flex flex-col min-h-0 overflow-hidden">

          {/* 방 목록 그리드 */}
          <div className="relative grid grid-cols-3 gap-4 pt-4 px-4 overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 content-start">
            {isLoading ? (
              <div className="absolute inset-0 z-20 flex justify-center items-center bg-black/10 backdrop-blur-[1px] rounded-xl">
                <span className="text-white text-xl animate-pulse">방 목록을 불러오고 있습니다...</span>
              </div>
            ) : rooms.length > 0 ? (
              rooms.map((room) => (
                <RoomCard
                  key={room.roomId}
                  roomCode={room.roomId.substring(0, 8)}
                  title={room.title}
                  hostName={room.isPrivate ? "PRIVATE" : "PUBLIC"}
                  current={room.currentCount}
                  capacity={room.capacity}
                  onJoin={() => handleJoinRoom(room)}
                />
              ))
            ) : (
              <div className="col-span-3 flex justify-center items-center h-[350px]">
                <span className={`text-xl transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100 text-white/50 italic uppercase tracking-widest'}`}>
                  입장 가능한 방이 없습니다
                </span>
              </div>
            )}
          </div>

          {/* 페이지네이션 (백엔드 totalPages 지원 시 연동 가능) */}
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