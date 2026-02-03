const TimeScreen = ({ timeLeft, gameStatus }) => {
  // 낮/밤 상태에 따른 아이콘 및 스타일 결정
  const isDayPhases = ["COUNTDOWN", "ASSIGN_ROLE", "DAY", "VOTE_1", "DEFENSE", "VOTE_2", "DAY_RESULT", "GAME_END"].includes(gameStatus);

  return (
    <div className="bg-black/80 border border-white/10 px-8 py-2 rounded-full flex items-center gap-4 shadow-lg transition-all duration-1000">
      <span className={`text-2xl ${isDayPhases ? 'text-yellow-400' : 'text-blue-400'} animate-pulse`}>
        {isDayPhases ? "☀️" : "🌙"}
      </span>
      <span className="text-white font-mono text-3xl font-black tracking-widest min-w-[100px] text-center">
        {timeLeft}
      </span>
    </div>
  );
};

export default TimeScreen;