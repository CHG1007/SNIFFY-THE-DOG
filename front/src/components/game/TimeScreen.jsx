// 페이즈 한글 이름
const PHASE_NAMES = {
  WAITING: '대기 중',
  COUNTDOWN: '게임 시작',
  ASSIGN_ROLE: '역할 확인',
  DAY: '낮 토론',
  VOTE_1: '용의자 지목',
  DEFENSE: '최후 변론',
  VOTE_2: '찬반 투표',
  NIGHT: '밤',
  DAY_RESULT: '결과 발표',
  GAME_END: '게임 종료',
};

const TimeScreen = ({ timeLeft, gameStatus, onSkipTimer }) => {
  // 낮/밤 상태에 따른 아이콘 및 스타일 결정
  const isDayPhases = ["COUNTDOWN", "ASSIGN_ROLE", "DAY", "VOTE_1", "DEFENSE", "VOTE_2", "DAY_RESULT", "GAME_END"].includes(gameStatus);
  const phaseName = PHASE_NAMES[gameStatus] || gameStatus;

  return (
    <div className="bg-black/80 border border-white/10 px-8 py-2 rounded-full flex items-center gap-4 shadow-lg transition-all duration-1000">
      <span className={`text-2xl ${isDayPhases ? 'text-yellow-400' : 'text-blue-400'} animate-pulse`}>
        {isDayPhases ? "☀️" : "🌙"}
      </span>
      <span className={`text-sm font-bold ${isDayPhases ? 'text-yellow-300' : 'text-blue-300'}`}>
        {phaseName}
      </span>
      <span className="text-white font-mono text-3xl font-black tracking-widest min-w-[80px] text-center">
        {timeLeft}
      </span>
      {/* DEV 모드 전용 테스트 버튼 — 현재 페이즈를 3초 남은 상태로 스킵 */}
      {import.meta.env.DEV && onSkipTimer && (
        <button
          onClick={onSkipTimer}
          className="ml-2 text-xs bg-orange-600/80 hover:bg-orange-500 text-white px-2 py-0.5 rounded cursor-pointer"
        >
          3초 남기기
        </button>
      )}
    </div>
  );
};

export default TimeScreen;