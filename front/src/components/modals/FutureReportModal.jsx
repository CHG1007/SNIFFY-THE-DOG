import React, { useEffect, useRef } from "react";

const FutureReportModal = ({ isOpen, onClose, data }) => {
  const scrollRef = useRef(null);


  const splitMessage = (fullMessage) => {
    if (!fullMessage) return { mainText: "", trophy: "" };
    const parts = fullMessage.split("🏆 전리품 획득:");
    return {
      mainText: parts[0].trim(),
      trophy: parts[1] ? parts[1].trim() : null
    };
  };

  const { mainText, trophy } = splitMessage(data?.message);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const container = scrollRef.current;
      
      // 시작 시 스크롤 위치를 맨 위로 초기화
      container.scrollTop = 0.5;

      // 애니메이션 로직: 초당 일정 픽셀씩 아래로 스크롤
      let animationFrameId;
      const scrollSpeed = 1.1; // 숫자가 낮을수록 느려집니다.

      const step = () => {
        // 사용자가 끝까지 도달하면 정지
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
          cancelAnimationFrame(animationFrameId);
          return;
        }

        container.scrollTop += scrollSpeed;
        animationFrameId = requestAnimationFrame(step);
      };

      // 1초 뒤에 스크롤 시작 (몰입감을 위해)
      const timeoutId = setTimeout(() => {
        animationFrameId = requestAnimationFrame(step);
      }, 800);

      // 사용자가 휠을 움직이면 애니메이션 중단 (선택 사항)
      const stopAnimation = () => cancelAnimationFrame(animationFrameId);
      container.addEventListener("wheel", stopAnimation, { once: true });
      container.addEventListener("touchstart", stopAnimation, { once: true });

      return () => {
        cancelAnimationFrame(animationFrameId);
        clearTimeout(timeoutId);
      };
    }
  }, [isOpen]);
  
  // 데이터가 없거나 닫혀있으면 출력 안 함
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-[#3e2a14]">
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .parchment-text { font-family: 'Pretendard', sans-serif; }
        `}
      </style>

      {/* 양피지 배경 컨테이너 */}
      <div 
        className="relative w-full max-w-[500px] h-[80vh] max-h-[700px] bg-[#f4e4bc] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        style={{ 
          backgroundImage: "url('/assets/images/parchment_texture.png')",
          backgroundSize: "cover",
          borderRadius: "8px",
          border: "10px double #6b4f31"
        }}
      >
        {/* 내부 스크롤 영역 (Ref 연결) */}
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto scrollbar-hide p-8 md:p-12 scroll-smooth"
        >
          <div className="flex flex-col items-center">
            
            {/* 상단 여백: 시작 시 글자가 아래에서 올라오게 함 */}
            <div className="flex-shrink-0" />

            {/* 1. 직업 타이틀 */}
            <div className="text-center mb-24 w-full">
              <p className="text-[#8b6b4d] text-xs font-bold tracking-[0.2em] mb-3">FUTURE REPORT</p>
              <h2 className="text-4xl md:text-5xl font-black break-keep leading-tight" style={{ fontFamily: "ChosunGu, serif" }}>
                {data.jobTitle}
              </h2>
            </div>

            {/* 2. 스탯 */}
            {data.stats && data.stats.map((stat, idx) => (
              <div key={idx} className="mb-20 text-center w-full">
                <p className="text-[#8b6b4d] text-2xl font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-4xl font-bold my-2 tracking-tighter">{stat.value}</p>
                <p className="text-[#6b4f31] text-xl italic opacity-80">{stat.desc}</p>
              </div>
            ))}

            {/* 3. 메인 메시지 */}
            <div className="text-center px-2 w-full">
              <div className="w-16 h-[1px] bg-[#6b4f31] mx-auto mb-8 opacity-30" />
              <p className="text-xl leading-[1.8] break-keep font-large mb-12" style={{ fontFamily: "Pretendard" }}>
                {mainText.split('\n').map((line, i) => (
                  <span key={i} className="block mb-2">{line}</span>
                ))}
              </p>
            </div>

            {/* 4. 전리품 영역 */}
            {trophy && (
              <div className="w-full text-center mb-24">
                {/* 심플한 구분선 */}
                <hr className="border-t border-[#6b4f31] opacity-30 mb-12 w-1/2 mx-auto" />
                <p className="text-2xl font-bold text-[#b8860b]">
                   🏆 전리품 획득: {trophy}
                </p>
              </div>
            )}

            {/* 5. 푸터 */}
            <div className="mb-20 text-center w-full">
              <h1 className="text-2xl font-bold mb-10 opacity-30">THE END</h1>
              <button
                onClick={onClose}
                className="px-10 py-4 bg-[#3e2a14] text-[#f4e4bc] rounded-md font-bold hover:bg-[#5a3e1e] transition-all active:scale-95 border border-[#2a1a0a]"
              >
                확인
              </button>
            </div>
          </div>
        </div>

        {/* 상하단 그라데이션 커버 */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#3e2a14]/15 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#3e2a14]/15 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default FutureReportModal;