import { useState, useEffect } from 'react';

const TimeLine = ({ duration, onTimeout }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 100ms마다 게이지를 갱신하여 부드럽게 줄어들게 합니다.
    const intervalTime = 100;
    const totalSteps = (duration * 1000) / intervalTime;
    const stepSize = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onTimeout) onTimeout(); // 시간이 다 되면 콜백 실행
          return 100;
        }
        return prev + stepSize;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, onTimeout]);

  return (
    <div className="relative w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div 
        className="h-full bg-[#ff8a00] transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,138,0,0.5)]"
        style={{ width: `${progress}%` }} 
      />
      <div className="absolute right-0 -top-6 text-[#ff8a00] text-xs font-bold italic">
        {duration}초 뒤 닫힙니다.
      </div>
    </div>
  );
};

export default TimeLine;