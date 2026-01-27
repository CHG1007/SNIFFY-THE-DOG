import TimeLine from "../game/TimeLine";

const NothingHappenModal = ({ onTimeout }) => {
    return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-2xl px-10 flex flex-col items-center">
        <div className="mb-10">
          {/* 캐릭터 이미지는 프로젝트 assets 폴더에 맞게 수정하세요 */}
          <img 
            src="/assets/dog_character.png" 
            className="w-48 h-48 object-contain grayscale opacity-60" 
            alt="nothing" 
          />
        </div>
        
        <h2 className="text-4xl text-white font-black mb-16 italic tracking-tight text-center leading-tight">
          "아무 일도 <br/>
          <span className="text-gray-400">일어나지 않았습니다."</span>
        </h2>

        <div className="w-full">
          {/* 5초 후 다음 단계로 이동 */}
          <TimeLine duration={5} onTimeout={onTimeout} />
        </div>
      </div>
    </div>
  );
};

export default NothingHappenModal;