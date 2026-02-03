const UserSelectModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // 배경: 이미지처럼 어둡고 살짝 불투명하게
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      
      {/* 모달 박스: 이미지의 모달 사이즈와 유사하게 조정 (w-[400px]) */}
      <div className="w-[400px] bg-[#1c1c1c] border border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* 우측 상단 X 버튼: 하얀색 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 내부 콘텐츠 섹션 (이미지처럼 여백을 넉넉히) */}
        <div className="p-12 flex flex-col items-center">
          
          {/* 제목 부분: 이미지의 '게임 찾기' 느낌 */}
          <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">
            사용자 선택
          </h2>

          {/* 안내 문구: 중앙 정렬 */}
          <div className="text-center mb-2">
            <p className="text-lg text-gray-300 leading-relaxed">
              분석할 사용자의 <br />
              <span className="text-[#ff8a00] font-semibold">화면을 클릭</span>해주세요.
            </p>
          </div>

          {/* 하단 여백용 (이미지의 입장하기 버튼 위치 느낌을 살림) */}
          <div className="mt-6 w-full h-1 border-t border-gray-800/50"></div>
          <p className="mt-4 text-xs text-gray-500">클릭 시 5초간 분석이 시작됩니다.</p>
        </div>
        
      </div>
    </div>
  );
};

export default UserSelectModal;