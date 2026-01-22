import XBtn from "../common/XBtn"; 

const ModalWrapper = ({ isOpen, onClose, children, className = "" }) => {
  // 로직 1: 모달이 열려있지 않으면 아무것도 화면에 그리지 않음
  if (!isOpen) return null;

  return (
    // 레이아웃 1: 전체 화면을 덮는 어두운 배경 (Overlay)
    <div 
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4"
      onClick={onClose} // 로직 2: 배경 클릭 시 모달 닫기
    >
      
      {/* 레이아웃 2: 실제 모달이 그려지는 흰색/어두운 박스 */}
      <div 
        className={`bg-[#1e1e1e] w-[450px] rounded-2xl p-8 relative border border-white/10 shadow-2xl ${className || 'min-h-[430px]'}`}
        onClick={(e) => e.stopPropagation()} // 로직 3: 박스 내부 클릭 시 닫힘 방지
      >
        
        {/* 레이아웃 3: 닫기 버튼 (모달 안에서 항상 같은 위치) */}
        <div className="absolute top-6 right-6">
          <XBtn onClick={onClose} />
        </div>

        {/* 레이아웃 4: 각 모달의 실제 내용물 (개별 컴포넌트들) */}
        <div className="w-full h-full">
          {children}
        </div>

      </div>
    </div>
  );
};

export default ModalWrapper;