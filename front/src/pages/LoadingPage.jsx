const LoadingPage = ({ message = "Finding Traitor...", subMessage = "누가 선량한 시민인가, 누가 배신자인가." }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />
      
      {/* 로딩 애니메이션 */}
      <div className="relative mb-10">
        <div className="w-20 h-20 border-4 border-t-primary border-white/5 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🔍</div>
      </div>

      {/* 동적으로 변하는 텍스트 영역 */}
      <h2 className="text-primary text-3xl font-black tracking-[0.3em] uppercase italic animate-pulse">
        {message}
      </h2>
      <p className="text-gray-500 mt-6 text-sm font-bold tracking-widest uppercase opacity-60 text-center px-4">
        {subMessage}
      </p>
    </div>
  );
};

export default LoadingPage;