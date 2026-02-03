import { ChevronLeft, ChevronRight } from 'lucide-react';

// 1. 계산 로직 함수를 컴포넌트 외부에 둡니다 (컴포넌트가 리렌더링될 때마다 재정의되지 않게 함)
const getPaginationRange = (currentPage, totalPages) => {
  // 전체 페이지가 5개 이하면 그냥 다 보여줌
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // 1. 현재 페이지가 앞쪽(1, 2, 3)일 때: 1 2 3 4 5 고정
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  // 2. 현재 페이지가 뒤쪽(마지막-2, 마지막-1, 마지막)일 때: 끝에서 5개 고정
  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // 3. 중간일 때: 현재 페이지를 중심으로 앞뒤 2개씩 총 5개 유지
  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
};

// 2. 컴포넌트 본체
const Pagination = ({ currentPage, totalPages, onSelect, onPrev, onNext }) => {
  // 컴포넌트 안에서 함수를 호출하여 화면에 뿌릴 배열을 만듭니다.
  const allPages = getPaginationRange(currentPage, totalPages);

  return (
    <div className="flex items-center gap-2 select-none">
      {/* 이전 버튼 */}
      <button 
        onClick={onPrev}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      {/* 페이지 번호들 */}
      {allPages.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onSelect(page)}
          className={`
            min-w-[36px] h-9 flex items-center justify-center rounded-lg font-bold transition-all
            ${page === '...' ? 'cursor-default text-gray-500' : 'cursor-pointer'}
            ${currentPage === page 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'text-gray-400 hover:bg-white/5 hover:text-white'}
          `}
        >
          {page}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button 
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
