const WaitingLayout = ({ children, title }) => {
  return (
    // 할로윈 느낌의 어두운 배경 (나중에 실제 배경 이미지를 넣으시면 됩니다)
    <div className="min-h-screen bg-[#0a0a0f] bg-opacity-95 p-8 flex flex-col items-center relative overflow-hidden">
      {/* 상단 방 제목 */}
      <h1 className="text-primary text-5xl font-black mb-12 italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,138,0,0.5)]">
        {title}
      </h1>

      {/* 실제 내용물이 들어갈 자리 */}
      <div className="flex w-full max-w-7xl gap-10 justify-center z-10">
        {children}
      </div>
      
      {/* 배경 장식 (선택 사항) */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orange-900/10 to-transparent pointer-events-none" />
    </div>
  );
};

export default WaitingLayout;