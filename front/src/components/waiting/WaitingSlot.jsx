import { useState } from 'react'; 
import VideoCanvas from "../video/VideoCanvas";
import ReadyBtn from "./ReadyBtn"; 

const WaitingSlot = ({ player, isMe }) => {
  // 현재 레디 상태를 관리하는 State (초기값은 player에서 받은 값)
  const [isReady, setIsReady] = useState(player.isReady);

  // 클릭했을 때 실행될 함수
  const handleReadyClick = () => {
    // 현재 상태가 true면 false로, false면 true로 반전시킵니다.
    setIsReady(!isReady);
    console.log(`${player.name}님의 레디 상태:`, !isReady);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[300px]">
      {/* 영상 영역 */}
      <div className={`relative aspect-video bg-[#1a1a1a] rounded-xl border-2 overflow-hidden
        ${player.isHost ? 'border-[#ff8a00]' : 'border-white/10'}`}>
        
        <VideoCanvas stream={player.stream} isMuted={isMe} />

        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white">
          {player.name} {isMe && "(나)"}
        </div>

        {player.isHost && (
          <div className="absolute top-2 right-2 text-xl">🐾</div>
        )}
      </div>

      <ReadyBtn 
        isReady={isReady}        // 위에서 만든 State 전달
        isMe={isMe}              // 부모에게 받은 isMe 전달
        onClick={handleReadyClick} // 클릭 시 실행할 함수 전달
      />
    </div>
  );
};

export default WaitingSlot;