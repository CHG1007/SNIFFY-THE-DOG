import ModalWrapper from './ModalWrapper';

const AiAnalyzeModal = ({ isOpen, onClose, data, nickname }) => {
  // 데이터가 없으면 렌더링하지 않음
  if (!data) return null;

  const { totalSummary, myReport } = data;
  // 내 닉네임에 해당하는 리포트 추출 (데이터가 없으면 기본 문구)
  const displayReport = myReport || "분석 데이터를 찾을 수 없습니다.";

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full text-white">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-4">
          <span className="text-2xl">🔍</span>
          <h2 className="text-[22px] font-bold text-[#FF8A00] tracking-tight">
            AI 매치 분석 결과
          </h2>
        </div>

        {/* 전체 흐름 분석 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] text-gray-400 font-medium tracking-wider">전체 게임 흐름</span>
            <div className="flex-1 h-[1px] bg-white/10"></div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-[15px] leading-relaxed border-l-4 border-gray-500 whitespace-pre-wrap">
            {totalSummary}
          </div>
        </div>

        {/* 개인 행동 분석 */}
        <div className="mb-8 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] text-gray-400 font-medium tracking-wider">나의 플레이 분석</span>
            <div className="flex-1 h-[1px] bg-white/10"></div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-[15px] leading-relaxed border-l-4 border-[#FF8A00] whitespace-pre-wrap">
            {displayReport}
          </div>
        </div>

        {/* 하단 버튼 */}
        <button 
          onClick={onClose}
          className="w-full py-3.5 bg-[#FF8A00] hover:bg-[#e67c00] text-black font-bold rounded-xl transition-colors"
        >
          확인
        </button>
      </div>
    </ModalWrapper>
  );
};

export default AiAnalyzeModal;