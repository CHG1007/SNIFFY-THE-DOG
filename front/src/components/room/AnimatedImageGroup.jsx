export default function AnimatedImageGroup({ images }) {
  const doubledImages = [...images, ...images];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col gap-6 animate-infinite-scroll">
        {doubledImages.map((src, idx) => (
          /* 1. 컨테이너: 배경을 검정색으로 하고 양옆에 필름 구멍 공간 확보 */
          <div key={idx} className="relative bg-[#111] p-1 rounded-sm shadow-2xl shrink-0 overflow-hidden border-x-[12px] border-[#111]">
            
            {/* 2. 왼쪽 타공 구멍 패턴 (레이아웃에 영향 없음) */}
            <div 
              className="absolute top-0 left-[-8px] bottom-0 w-2 z-10 opacity-40"
              style={{
                backgroundImage: 'linear-gradient(to bottom, #000 50%, transparent 50%)',
                backgroundSize: '100% 12px'
              }} 
            />

            {/* 3. 이미지: 기존 크기 h-[180px] 유지 */}
            <img
              src={src}
              alt=""
              className="w-full h-[180px] object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500" 
            />

            {/* 4. 오른쪽 타공 구멍 패턴 (레이아웃에 영향 없음) */}
            <div 
              className="absolute top-0 right-[-8px] bottom-0 w-2 z-10 opacity-40"
              style={{
                backgroundImage: 'linear-gradient(to bottom, #000 50%, transparent 50%)',
                backgroundSize: '100% 12px'
              }} 
            />
            
            {/* 5. 오버레이: 아주 살짝 오래된 필름 느낌의 그림자 */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]" />
          </div>
        ))}
      </div>
    </div>
  );
}