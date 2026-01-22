import GameHistoryRow from './GameHistoryRow';

const GameHistoryTable = () => {
  // 실제로는 나중에 백엔드 API에서 받아올 데이터입니다.
  const historyData = [
    { id: 1, date: "2026.01.15", role: "마피아", result: "승리" },
    { id: 2, date: "2026.01.14", role: "경찰", result: "패배" },
    { id: 3, date: "2026.01.12", role: "시민", result: "승리" },
    { id: 4, date: "2026.01.12", role: "시민", result: "승리" },
    { id: 5, date: "2026.01.12", role: "시민", result: "승리" },
    { id: 6, date: "2026.01.12", role: "시민", result: "승리" },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full">
      
      {/* 컬럼 제목 영역 */}
      <div className="grid grid-cols-4 text-white text-xl font-bold mb-4 px-5 border-b border-white/20 pb-4">
        <span className="text-center">날짜</span>
        <span className="text-center">역할</span>
        <span className="text-center">결과</span>
        <span className="text-center">AI 분석 결과</span>
      </div>

      {/* 데이터 행들 (간격을 좁게 설정) */}
      <div className="flex flex-col h-[280px] overflow-y-auto pr-2 custom-scrollbar">
        {historyData.map((game) => (
          <GameHistoryRow key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default GameHistoryTable;