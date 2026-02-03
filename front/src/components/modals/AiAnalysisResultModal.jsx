// 분석 결과를 보여주는 모달창
const AiAnalysisResultModal = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] border border-white/20 p-6 rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-yellow-400">🔍 AI 분석 리포트</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="bg-white/5 p-4 rounded-lg mb-6 min-h-[100px] flex flex-col justify-center">
          <p className="text-sm text-white/40 mb-2 font-semibold uppercase tracking-wider">대상: {result.identity}</p>
          <p className="text-lg leading-relaxed text-white/90">
            {result.narrative || "분석 데이터를 가져오지 못했습니다."}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default AiAnalysisResultModal;