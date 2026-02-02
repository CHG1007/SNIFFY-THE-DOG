import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 0) return null;

  // 페이지 번호 배열 생성
  const pages = [];
  // 단순하게 모든 페이지를 보여주는 방식 (페이지 수가 많아지면 로직 개선 필요)
  // 여기서는 최대 5개 정도만 보여주는 로직 등을 추가할 수 있으나, 지시사항에 따라 단순 구현
  // 다만 너무 길어지는 것을 방지하기 위해 간단히 start/end 로직을 넣거나
  // 일단 전체를 다 보여주되, UI가 깨지지 않게 flex-wrap을 사용
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // 표시할 페이지 범위 계산 (선택사항, UX 개선용)
  // 현재 페이지 주변 5개만 보여주기
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  const visiblePages = pages.slice(startPage - 1, endPage);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
      >
        이전
      </button>

      <div className="flex gap-2 mx-2">
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
              currentPage === page
                ? 'bg-[#ff8a00] text-black'
                : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] hover:text-white'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
      >
        다음
      </button>
    </div>
  );
};

export default Pagination;
