import { useState, useEffect } from 'react';

const TimeLine = ({ duration, onTimeout }) => {
  const [progress, setProgress] = useState(0);
  const [displayTime, setDisplayTime] = useState(duration);

  useEffect(() => {
    // 100ms마다 게이지를 갱신하여 부드럽게 줄어들게 합니다.
    const intervalTime = 50;
    const totalSteps = (duration * 1000) / intervalTime;
    const stepSize = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onTimeout) onTimeout(); // 시간이 다 되면 콜백 실행
          return 100;
        }
        const newLeft = Math.ceil(duration - (prev + stepSize) * duration / 100);
        if (newLeft >= 0) setDisplayTime(newLeft);
        
        return prev + stepSize;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, onTimeout]);

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex justify-end pr-1">
        <span className="text-gray-400 text-sm font-medium tabular-nums">
          남은 시간 앞으로 {displayTime}초...
        </span>
      </div>
      <div className="relative w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-white/10">
        <div 
          className="h-full bg-gradient-to-r from-primary to-[#ff5f00] transition-all duration-75 ease-linear shadow-[0_0_20px_rgba(255,138,0,0.6)]"
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
};

export default TimeLine;