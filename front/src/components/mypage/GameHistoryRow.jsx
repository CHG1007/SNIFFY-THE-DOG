// import ReportResultBtn from './ReportResultBtn';

// const GameHistoryRow = ({ game }) => {
//   // game 객체에는 date, role, result 등의 정보가 들어있다고 가정합니다.
//   return (
//     /* 배경(bg-)과 테두리(border)를 제거하고 패딩만 남깁니다. */
//     <div className="grid grid-cols-4 items-center py-3 px-5 text-white text-lg border-b border-white/5 last:border-0">
//       <span className="text-center text-gray-300 font-medium">{game.date}</span>
//       <span className="text-center font-bold">{game.role}</span>
      
//       {/* 결과에 따른 색상 */}
//       <span className={`text-center font-black ${game.result === '승리' ? 'text-[#00ffcc]' : 'text-[#ff8a00]'}`}>
//         {game.result}
//       </span>
      
//       <div className="flex justify-center">
//         <ReportResultBtn result={game.result} />
//       </div>
//     </div>
//   );
// };

// export default GameHistoryRow;
// const GameHistoryRow = ({ date, role, result, team, onReport }) => {
//   const getRoleIcon = (role) => {
//     if (role === 'MAFIA') return '🐺';
//     if (role === 'POLICE') return '👮';
//     return '👤';
//   };

//   const getResultColor = (result) => {
//     return result === 'WIN' ? '#00d4ff' : '#ff4444';
//   };

//   return (
//     <div className="game-row">
//       <div className="date-col">{date}</div>
//       <div className="role-col">
//         <span className="role-icon">{getRoleIcon(role)}</span>
//         <span className="role-text">{role}</span>
//       </div>
//       <div className="result-col" style={{ color: getResultColor(result) }}>
//         {result}
//       </div>
//       <div className="team-col">{team}</div>
//       <div className="action-col">
//         <button className="report-btn" onClick={onReport}>
//           REPORT
//         </button>
//       </div>

//       <style jsx>{`
//         .game-row {
//           display: grid;
//           grid-template-columns: 180px 1fr 1fr 1fr 200px;
//           align-items: center;
//           padding: 20px 30px;
//           background: rgba(139, 101, 78, 0.4);
//           border-radius: 12px;
//           margin-bottom: 12px;
//           font-family: 'Orbitron', 'Noto Sans KR', sans-serif;
//           transition: all 0.3s ease;
//         }

//         .game-row:hover {
//           background: rgba(139, 101, 78, 0.5);
//           transform: translateX(4px);
//         }

//         .date-col {
//           font-size: 18px;
//           color: rgba(255, 255, 255, 0.9);
//           font-weight: 500;
//         }

//         .role-col {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .role-icon {
//           font-size: 32px;
//         }

//         .role-text {
//           font-size: 20px;
//           font-weight: 700;
//           color: #fff;
//           letter-spacing: 1px;
//         }

//         .result-col {
//           font-size: 22px;
//           font-weight: 900;
//           letter-spacing: 1.5px;
//         }

//         .team-col {
//           font-size: 18px;
//           color: rgba(255, 255, 255, 0.95);
//           font-weight: 600;
//         }

//         .action-col {
//           display: flex;
//           justify-content: flex-end;
//         }

//         .report-btn {
//           padding: 12px 32px;
//           background: rgba(255, 255, 255, 0.15);
//           border: 2px solid rgba(255, 255, 255, 0.3);
//           border-radius: 8px;
//           color: #fff;
//           font-size: 16px;
//           font-weight: 700;
//           font-family: 'Orbitron', sans-serif;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           letter-spacing: 1px;
//         }

//         .report-btn:hover {
//           background: rgba(255, 255, 255, 0.25);
//           border-color: rgba(255, 255, 255, 0.5);
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
//         }

//         .report-btn:active {
//           transform: translateY(0);
//         }
//       `}</style>
//     </div>
//   );
// };

// export default GameHistoryRow;

const GameHistoryRow = ({ date, role, result, onReport }) => {
  // 도트 이미지 경로 설정 (Stardew Valley 스타일)
  const roleIcon = role === 'MAFIA' ? '/assets/images/roles/mafia_dog.png' : '/assets/images/roles/police_dog.png';
  const isWin = result === 'WIN';

  return (
    <div className="grid grid-cols-[1.2fr_1.8fr_1fr_1.5fr] items-center px-8 py-4 bg-[#FFFFFF]/40 rounded-[10px] hover:bg-white/25 transition-all shadow-inner">
      <div className="text-white text-xl font-bold text-center tracking-tight">{date}</div>

      <div className="flex items-center justify-center gap-4">
        <img src={roleIcon} alt={role} className="w-12 h-12 object-contain drop-shadow-md" />
        <span className="text-white text-2xl font-black italic">{role}</span>
      </div>

      <div className={`text-2xl font-black text-center ${isWin ? 'text-cyan-400' : 'text-red-500'} drop-shadow-sm`}>
        {result}
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onReport}
          className="w-full max-w-[150px] py-2.5 bg-[#e2e2e2] hover:bg-white text-black font-black rounded-xl transition-all shadow-lg active:scale-95 text-sm"
        >
          AI 분석 보기
        </button>
      </div>
    </div>
  );
};

export default GameHistoryRow;