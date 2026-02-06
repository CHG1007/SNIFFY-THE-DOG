import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import GameHistoryTable from './GameHistoryTable';
import Pagination from '../common/Pagination';

const UserHistorySection = ({ games, onReport }) => {
  const hasGames = games && games.length > 0;
  const [emptyAnim, setEmptyAnim] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGames = hasGames ? games.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = hasGames ? Math.ceil(games.length / itemsPerPage) : 0;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  return (
    <div className="w-full flex flex-col items-start mt-0">
      {/* 타이틀 */}
      <h3 className="text-white/80 text-2xl font-bold mb-6 tracking-tight drop-shadow-md">
        전적
      </h3>
      
      <div className="w-full">
        {/* 테이블 헤더 - 항상 표시 */}
        <div className="grid grid-cols-[1.2fr_1.8fr_1fr_1.5fr] px-8 py-3 mb-4 border-b border-white/20 bg-white/10 rounded-t-lg backdrop-blur-sm">
          <div className="text-white/80 text-lg font-bold text-center tracking-tight">날짜</div>
          <div className="text-white/80 text-lg font-bold text-center tracking-tight">역할</div>
          <div className="text-white/80 text-lg font-bold text-center tracking-tight">결과</div>
          <div className="text-white/80 text-lg font-bold text-center tracking-tight">AI 분석</div>
        </div>

        {hasGames ? (
          <>
            <GameHistoryTable games={currentGames} onReport={onReport} />
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          /* 전적이 없을 때 표시할 Empty State */
          <div className="w-full min-h-[250px] bg-[#FFC19A]/30 backdrop-blur-xl rounded-[10px] p-8 shadow-2xl border border-white/5 flex items-center justify-center">
            <div className="flex flex-col justify-center items-center h-[250px] gap-4">
              <div className="w-[180px] h-[180px] opacity-70">
                {emptyAnim && <Lottie animationData={emptyAnim} loop autoplay />}
              </div>
              <span className="text-xl text-white/50 text-pretendard font-semibold uppercase tracking-widest">
                아직 플레이한 전적이 없습니다
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHistorySection;