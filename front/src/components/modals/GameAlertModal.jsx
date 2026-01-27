import TimeLine from '../game/TimeLine';

const GameAlertModal = ({ title, message, targetPlayer, onTimeout }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-4xl px-10 flex flex-col items-center">
        {/* 결과 타이틀 (CITIZEN WIN 등) */}
        <h1 className="text-6xl font-black text-red-600 mb-16 tracking-[0.2em] drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          {title}
        </h1>
        
        {/* 캐릭터 이미지 및 사망 효과 */}
        <div className="relative mb-10">
          <div className="w-56 h-56 rounded-full border-4 border-white/20 overflow-hidden bg-gray-800 shadow-2xl">
            <img 
              src={targetPlayer?.photo || "/assets/dog_character.png"} 
              className="w-full h-full object-cover" 
              alt="target" 
            />
          </div>
          {/* 사망 효과 등이 들어갈 자리 */}
          {message.includes("처형") && (
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-8xl opacity-80">💀</span>
            </div>
          )}
        </div>

        <p className="text-4xl text-white font-bold mb-20 leading-tight text-center">
          <span className="text-[#ff8a00]">{targetPlayer?.nickname}</span>님이<br/>
          <span className="text-gray-200 mt-2 block text-3xl">{message}</span>
        </p>

        {/* 2초 뒤 자동 닫힘 */}
        <div className="w-full max-w-2xl">
          <TimeLine duration={5} onTimeout={onTimeout} />
        </div>
      </div>
    </div>
  );
};

export default GameAlertModal;