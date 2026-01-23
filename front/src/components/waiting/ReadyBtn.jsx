// isReady: 현재 준비 상태 (true/false)
// isMe: 이 버튼이 '나'의 것인지 여부
// onClick: 버튼을 눌렀을 때 실행할 함수
const ReadyBtn = ({ isReady, isMe, onClick }) => {
  return (
    <button
      // 1. 내가 아닐 경우 클릭 기능을 비활성화합니다.
      disabled={!isMe}
      onClick={onClick}
      
      // 2. 상태에 따른 스타일 결정 (Tailwind CSS)
      className={`
        w-full py-3 rounded-xl font-black text-2xl transition-all shadow-md
        ${isReady 
          ? 'bg-[#ff8a00] text-white'           // 준비 완료: 주황색
          : 'bg-[#1a1a1a] text-white/40 border border-white/10' // 준비 전: 어두운 회색
        }
        ${isMe 
          ? 'cursor-pointer hover:scale-[1.02] active:scale-95' // 내 버튼이면 효과 추가
          : 'cursor-default'                                    // 남의 버튼이면 효과 제거
        }
      `}
    >
      {/* 3. 텍스트 표시 (폰트 스타일에 따라 READY 혹은 준비완료 등으로 변경 가능) */}
      READY
    </button>
  );
};

export default ReadyBtn;