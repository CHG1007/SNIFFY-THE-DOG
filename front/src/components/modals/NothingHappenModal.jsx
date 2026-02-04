import TimeLine from "../game/TimeLine";

const NothingHappenModal = ({ onTimeout }) => {
    return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-2xl px-10 flex flex-col items-center justify-center min-h-[300px]">
        <h2 className="text-4xl text-white font-black mb-16 tracking-tight text-center leading-tight">
          밤 사이 아무 일도<br/>
          <span className="text-gray-400">일어나지 않았습니다.</span>
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