const ROLE_ICONS = {
  MAFIA: '/assets/images/mypage/mafia.png',
  POLICE: '/assets/images/mypage/police.png',
  DOCTOR: '/assets/images/mypage/doctor.png',
  CITIZEN: '/assets/images/mypage/citizen.png',
};

const GameHistoryRow = ({ date, role, result, onReport }) => {
  // 직업별 아이콘 매핑 (기본값: 시민)
  const roleIcon = ROLE_ICONS[role] || ROLE_ICONS.CITIZEN;
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