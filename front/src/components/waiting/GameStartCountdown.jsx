import { useState, useEffect } from 'react';

const GameStartCountdown = ({ onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete(); // 0초가 되면 부모가 전달한 함수(로딩창 이동 등) 실행
    }
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex items-center justify-center">
      <div className="flex flex-col items-center">
        <span className="text-white text-xl font-bold mb-4 tracking-widest animate-pulse">
          PREPARING GAME...
        </span>
        <h1 className="text-primary text-[12rem] font-black italic drop-shadow-[0_0_30px_rgba(255,138,0,0.5)] leading-none">
          {count > 0 ? count : "GO!"}
        </h1>
      </div>
    </div>
  );
};

export default GameStartCountdown;