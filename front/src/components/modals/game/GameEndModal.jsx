const GameEndModal = ({ isOpen, winnerTeam, mvpName, onResultClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-md">
      <div className="text-center">
        <h1 className={`text-6xl font-black mb-8
          ${winnerTeam === 'CITIZEN' ? 'text-green-500' : 'text-red-500'}`}>
          {winnerTeam === 'CITIZEN' ? '시민 승리!' : '마피아 승리!'}
        </h1>
        {mvpName && (
          <p className="text-2xl text-yellow-400 mb-12">
            MVP: {mvpName}
          </p>
        )}
        <button
          onClick={onResultClick}
          className="px-8 py-4 bg-[#ff8a00] text-white text-xl font-bold rounded-full hover:bg-orange-500 transition-all"
        >
          결과 화면 보기
        </button>
      </div>
    </div>
  );
};

export default GameEndModal;
