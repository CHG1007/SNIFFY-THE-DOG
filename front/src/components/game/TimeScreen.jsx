const TimeScreen = ({ timeLeft, gameStatus }) => {
  // 낮/밤 상태에 따른 아이콘 및 스타일 결정
  const isDay = gameStatus === "DAY";

  return (
    <div className="bg-black/80 border border-white/10 px-8 py-2 rounded-full flex items-center gap-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-1000">
      {/* 낮/밤 아이콘 */}
      <span className={`text-2xl ${isDay ? 'text-yellow-400' : 'text-blue-400'} animate-pulse`}>
        {isDay ? "☀️" : "🌙"}
      </span>
      
      {/* 남은 시간 */}
      <span className="text-white font-mono text-3xl font-black tracking-widest min-w-[100px] text-center">
        {timeLeft}
      </span>
    </div>
  );
};

export default TimeScreen;