import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// API
import { quickJoin, getRoomList, getRoomDetail } from "../api/roomApi";
import { useRoomEntry } from "../hooks/useRoomEntry";

// UI Components
import LeftPanel from "../components/room/LeftPanel";
import LobbyLayout from "../components/room/LobbyLayout";
import TopMenu from "../components/room/TopMenu";
import RoomCard from "../components/room/RoomCard";
import Pagination from "../components/room/Pagination";

import Lottie from "lottie-react";

// Modals
import FindGameModal from "../components/modals/FindGameModal";
import CreateGameModal from "../components/modals/CreateGameModal";

export default function RoomPage() {
  const navigate = useNavigate();
  const { enterRoom } = useRoomEntry();
  const [emptyAnim, setEmptyAnim] = useState(null);

  useEffect(() => {
    fetch("/assets/images/roompage/emptyroom.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then(setEmptyAnim)
      .catch((err) => {
        console.error("Empty room lottie load error:", err);
        setEmptyAnim(null);
      });
  }, []);

  // 상태 관리
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

  // 모달 상태 관리
  const [isFindGameOpen, setIsFindGameOpen] = useState(false);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);

  // 빠른 입장
  const handleQuickJoin = () => {
    // 1. 입장 가능한 공개방 필터링
    const candidates = rooms.filter(
      (room) => !room.isPrivate && room.currentCount < room.capacity
    );

    if (candidates.length > 0) {
      // 2. 인원수(currentCount) 내림차순 정렬 (많은 사람이 있는 방 우선)
      candidates.sort((a, b) => b.currentCount - a.currentCount);

      // 3. 가장 사람 많은 방 선택 (0번 인덱스)
      const targetRoom = candidates[0];
      
      console.log(`[QuickJoin] 입장 시도: ${targetRoom.title} (${targetRoom.currentCount}/${targetRoom.capacity}명)`);
      
      handleJoinRoom(targetRoom);
    } else {
      alert("현재 페이지에 입장 가능한 공개방이 없습니다.\n새로고침을 하거나 다른 페이지를 확인해주세요.");
    }
  };

  const fetchRooms = async (page) => {
    try {
      setIsLoading(true);
      const response = await getRoomList(page - 1, pageSize); // 0-based
      if (response.success) {
        const roomsData = response.data?.rooms ?? response.data ?? [];
        const pageInfo = response.data?.pageInfo;

        setRooms(roomsData);
        if (typeof pageInfo?.totalPages === "number") {
          setTotalPages(pageInfo.totalPages);
        }
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

  // 방 직접 입장
  const handleJoinRoom = async (room) => {
    try {
      const response = await getRoomDetail(room.roomId);
      if (response.success && response.data.status === "WAITING") {
        enterRoom(room.roomId, false);
      } else {
        alert("이미 게임이 진행 중이거나 입장이 불가한 방입니다.");
        fetchRooms(currentPage);
      }
    } catch (error) {
      console.error("입장 실패:", error);
      alert("방 입장에 실패했습니다.");
    }
  };

  // 페이지 이동
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handleSelect = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col">
      <LobbyLayout
        backgroundUrl="/assets/images/roompage/background.png"
        onVideoTest={() => navigate("/video-test")}
        topMenus={
          <>
            <TopMenu label="게임찾기" onClick={() => setIsFindGameOpen(true)} />
            <TopMenu label="게임생성" onClick={() => setIsCreateGameOpen(true)} />
            <TopMenu label="게임시작" onClick={handleQuickJoin} />
          </>
        }
        leftPanel={<LeftPanel />}
        mainPanel={
          <div className="w-full max-w-[1050px] h-[60vh] min-h-[465px] max-h-[550px] self-start flex flex-col rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 p-5 overflow-hidden shadow-2xl">
            <div className="w-full max-w-[1000px] mx-auto flex flex-col h-full min-h-0 overflow-hidden justify-between">
              {/* 방 목록 그리드 */}
              <div className="relative grid grid-cols-3 gap-4 pt-4 px-4 overflow-hidden flex-1 content-start">
                {rooms.length > 0 ? (
                  rooms.map((room) => (
                    <RoomCard
                      key={room.roomId}
                      roomCode={room.roomId.substring(0, 8)}
                      title={room.title}
                      hostName={(room.isPrivate ?? room.private) ? "PRIVATE" : "PUBLIC"}
                      current={room.currentCount}
                      capacity={room.capacity}
                      onJoin={() => handleJoinRoom(room)}
                    />
                  ))
                ) : (
                  <div className="col-span-3 flex flex-col justify-center items-center h-[380px] gap-2">
                    <div className="w-[180px] h-[180px]">
                      {emptyAnim ? <Lottie animationData={emptyAnim} loop autoplay /> : null}
                    </div>
                    <span className="text-xl text-white/50 text-pretendard font-semibold uppercase tracking-widest">
                      입장 가능한 방이 없습니다
                    </span>
                  </div>
                )}
              </div>

              {/* 페이지네이션 */}
              <div className="shrink-0 mt-auto flex justify-center pt-10 pb-2">
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
        {/* 모달 */}
        <FindGameModal isOpen={isFindGameOpen} onClose={() => setIsFindGameOpen(false)} />
        {isCreateGameOpen && (
          <CreateGameModal isOpen={isCreateGameOpen} onClose={() => setIsCreateGameOpen(false)} />
        )}
      </LobbyLayout>
    </div>
  );
}
