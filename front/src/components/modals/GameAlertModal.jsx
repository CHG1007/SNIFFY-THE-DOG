import TimeLine from '../game/TimeLine';

const GameAlertModal = ({ title, message, targetPlayer, onTimeout }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-center">
        {/* 결과 타이틀 (CITIZEN WIN 등) */}
        <h1 className="text-5xl font-black text-red-600 mb-10 tracking-widest">{title}</h1>
        
        {/* 캐릭터 이미지 및 사망 효과 */}
        <div className="relative mx-auto mb-6 w-40 h-40">
          <img 
            src={targetPlayer?.photo || "/assets/dog_character.png"} 
            className="w-full h-full object-contain" 
            alt="result" 
          />
          {/* 사망 시 탄흔 효과 등을 여기에 겹칠 수 있습니다 */}
        </div>

        <p className="text-2xl text-white font-bold mb-12">
          {targetPlayer?.displayName}님이 {message}
        </p>

        {/* 2초 뒤 자동 닫힘 */}
        <div className="w-64 mx-auto">
          <TimeLine duration={2} onTimeout={onTimeout} />
        </div>
      </div>
    </div>
  );
};

export default GameAlertModal;