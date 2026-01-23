import ReportResultBtn from './ReportResultBtn';

const GameHistoryRow = ({ game }) => {
  // game 객체에는 date, role, result 등의 정보가 들어있다고 가정합니다.
  return (
    /* 배경(bg-)과 테두리(border)를 제거하고 패딩만 남깁니다. */
    <div className="grid grid-cols-4 items-center py-3 px-5 text-white text-lg border-b border-white/5 last:border-0">
      <span className="text-center text-gray-300 font-medium">{game.date}</span>
      <span className="text-center font-bold">{game.role}</span>
      
      {/* 결과에 따른 색상 */}
      <span className={`text-center font-black ${game.result === '승리' ? 'text-[#00ffcc]' : 'text-[#ff8a00]'}`}>
        {game.result}
      </span>
      
      <div className="flex justify-center">
        <ReportResultBtn result={game.result} />
      </div>
    </div>
  );
};

export default GameHistoryRow;