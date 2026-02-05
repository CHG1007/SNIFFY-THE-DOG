const VoteConfirmModal = ({ isOpen, targetName, phaseSeconds, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-[#111115] p-8 rounded-2xl border-2 border-primary text-center max-w-sm w-full mx-4 shadow-[0_0_50px_rgba(255,138,0,0.2)]">
        <h3 className="text-white text-xl font-bold mb-2">
          <span className="text-primary">{targetName}</span>님에게<br/>투표하시겠습니까?
        </h3>

        {/* 사용자가 강조한 작은 글씨 카운트다운 */}
        <p className="text-red-300 text-sm font-medium mb-8 italic">
          투표 종료까지 {phaseSeconds > 0 ? phaseSeconds : 0}초 남았습니다!
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
          >
            취소
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-3 bg-primary hover:bg-[#ffae00] text-black rounded-xl font-bold transition-transform active:scale-95 transition-colors"
          >
            투표하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteConfirmModal;