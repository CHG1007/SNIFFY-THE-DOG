import GameHistoryRow from './GameHistoryRow';

const GameHistoryTable = ({ games, onReport }) => {
  return (
    <div className="w-full h-full bg-[#FFC19A]/30 backdrop-blur-xl rounded-[10px] p-8 shadow-2xl border border-white/5 flex flex-col overflow-hidden">      {/* 테이블 헤더: 아래 Row와 Grid 비율을 똑같이 맞춤 */}
      <div className="grid grid-cols-[1.2fr_1.8fr_1fr_1.5fr] px-10 mb-6 text-center shrink-0">
        <span className="text-white text-xl font-black">날짜</span>
        <span className="text-white text-xl font-black">역할</span>
        <span className="text-white text-xl font-black">결과</span>
        <span className="text-white text-xl font-black">AI 분석 결과</span>
      </div>

      {/* 데이터 행들만 스크롤되게 설정 (이게 시안처럼 나오는 핵심!) */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
        {games.map((game, index) => (
          <GameHistoryRow key={index} {...game} />
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default GameHistoryTable;