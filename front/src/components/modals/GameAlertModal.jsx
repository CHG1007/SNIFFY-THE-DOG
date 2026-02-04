import TimeLine from '../game/TimeLine';

const GameAlertModal = ({ title, message, targetPlayer, onTimeout }) => {
  const isDeath = message?.includes("사망") || message?.includes("처형");
  const isDraw = !targetPlayer;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-4xl px-10 flex flex-col items-center">
        {/* 결과 타이틀 */}
        <h1 className="text-6xl font-black text-red-600 mb-16 tracking-[0.2em] drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          {title}
        </h1>
        
        {isDeath && (
          // 사망/처형 시 요청된 해골 이미지
          <div className="flex justify-center mb-6">
             <img 
               src="/assets/images/gamepage/death.png" 
               className="w-40 h-40 object-contain drop-shadow-lg" 
               alt="dead" 
             />
          </div>
        )}

        {/* 메시지 표시 */}
        <p className="text-4xl text-white font-bold mb-20 leading-tight text-center">
          {isDraw ? (
            <span className="text-gray-200 mt-2 block text-3xl">아무도 지목되지 않았습니다.</span>
          ) : (
            <>
              <span className="text-[#ff8a00]">{targetPlayer?.nickname}</span>
              <span className="text-white">님이</span><br/>
              <span className="text-gray-200 mt-2 block text-3xl">{message}</span>
            </>
          )}
        </p>

        {/* 자동 닫힘 타이머 */}
        <div className="w-full max-w-2xl">
          <TimeLine duration={5} onTimeout={onTimeout} />
        </div>
      </div>
    </div>
  );
};

export default GameAlertModal;