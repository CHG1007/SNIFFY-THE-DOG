const LoadingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경에 깔리는 은은한 붉은 안개 효과 */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />
      
      {/* 중앙 로딩 애니메이션: 회전하는 리볼버 실린더 느낌 혹은 점멸하는 안개 */}
      <div className="relative mb-10">
        <div className="w-20 h-20 border-4 border-t-[#ff8a00] border-white/5 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
           🔍
        </div>
      </div>
      
      <h2 className="text-[#ff8a00] text-3xl font-black tracking-[0.3em] uppercase italic animate-pulse shadow-orange-500/50">
        Finding Traitor...
      </h2>
      
      <p className="text-gray-500 mt-6 text-sm font-bold tracking-widest uppercase opacity-60">
        누가 선량한 시민인가, 누가 배신자인가.
      </p>

      {/* 하단 장식: 가느다란 붉은 선 */}
      <div className="absolute bottom-10 w-32 h-[1px] bg-red-600/50 shadow-[0_0_10px_red]" />
    </div>
  );
};

export default LoadingPage;