import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

const LoadingPage = ({ message = "Finding Traitor...", subMessage = "누가 선량한 시민인가, 누가 배신자인가." }) => {
  const [loadingAnim, setLoadingAnim] = useState(null);
  
  useEffect(() => {
    fetch("/assets/images/loadingpage/loading.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        return res.json();
      })
      .then(setLoadingAnim)
      .catch((err) => {
        console.error("Loading lottie load error:", err);
        setLoadingAnim(null);
      });
  }, []);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />
      
      {/* 로딩 애니메이션 */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="w-80 h-80 md:w-[450px] md:h-[450px] transition-all duration-500">
          {loadingAnim ? (
            <Lottie 
              animationData={loadingAnim} 
              loop={true} 
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            /* 로딩 전 스피너 - 중앙 정렬 유지 */
            <div className="flex items-center justify-center h-full">
              <div className="w-16 h-16 border-4 border-t-[#ff8a00] border-white/5 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* 텍스트 정보 */}
        <div className="mt-4 text-center">
          <h2 className="text-[#ff8a00] text-3xl md:text-4xl font-black tracking-[0.4em] uppercase italic animate-pulse">
            {message}
          </h2>
          <p className="text-gray-500 mt-4 text-sm font-bold tracking-[0.2em] uppercase opacity-70">
            {subMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;