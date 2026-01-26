import { useState, useEffect } from 'react'; 
import VideoCanvas from "../video/VideoCanvas";
import ReadyBtn from "./ReadyBtn"; 

const WaitingSlot = ({ player, isMe, isHost, onKickRequest }) => {
  // 현재 레디 상태를 관리하는 State (초기값은 player에서 받은 값)
  const [isReady, setIsReady] = useState(player.isReady);
  
  const [isMicMuted, setIsMicMuted] = useState(false);
  
  // 🎤 오디오 바 수치 (0~100 사이의 가짜 데이터로 테스트)
  const [audioLevel, setAudioLevel] = useState(0);
  
  console.log("현재 플레이어 정보:", player.name, "방장여부:", player.isHost);

  // 나중에 WebRTC 연동 시 실제 마이크 볼륨을 여기에 연결할 겁니다.
  // 지금은 마이크가 켜져 있을 때만 움직이는 효과를 줍니다.
  useEffect(() => {
    // 마이크가 꺼져있으면 아예 아무것도 하지 않음
    if (isMicMuted) {
      return; 
    }

    // 마이크가 켜져있을 때만 인터벌 실행
    const interval = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 100));
    }, 100);

    // 클린업 함수: 마이크 상태가 변하거나 컴포넌트가 사라질 때 호출됨
    return () => {
      clearInterval(interval);
      setAudioLevel(0); // 여기서 수치를 초기화하는 것이 React의 권장 방식입니다.
    };
  }, [isMicMuted]);
  
    // 클릭했을 때 실행될 함수
  const handleReadyClick = () => {
    // 현재 상태가 true면 false로, false면 true로 반전시킵니다.
    setIsReady(!isReady);
    console.log(`${player.name}님의 레디 상태:`, !isReady);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[300px]">
      {/* 영상 영역 */}
      <div className={`relative group aspect-video bg-[#1a1a1a] rounded-xl border-2 overflow-hidden
        ${player.isHost ? 'border-[#ff8a00]' : 'border-white/10'}`}>
        
        {/* 강퇴 버튼 */}
        {isHost && !isMe && (
          <button
            onClick={() => onKickRequest(player)}
            className="absolute top-2 right-2 z-30 opacity-30 hover:opacity-100 cursor-pointer"
            title="강제 퇴장"
          >
            <span className="text-white text-xs">🚨</span>
          </button>
        )}

        {/* 비디오 캔버스 */}
        <VideoCanvas stream={player.stream} isMuted={isMe || isMicMuted} />

        {/* 좌측 하단: 이름표 및 오디오 바 정보 */}
        <div className="absolute bottom-2 left-2 z-20">
          <div className="bg-black/60 px-2 py-0.5 rounded text-xs text-white w-fit">
            {player.name} {isMe && "(나)"}
          </div>
        </div>

        {/* 우측 하단: 오디오 바 + 마이크 제어 버튼 그룹 */}
        <div className="absolute bottom-2 right-2 z-40">
          {!isMicMuted && (
            <div className="flex items-end gap-[2px] h-3 px-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-[#ff8a00] transition-all duration-100"
                  style={{ 
                    height: `${Math.max(20, audioLevel * (i * 0.2))}%`,
                    opacity: 0.4 + (i * 0.1)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 방장 표시 */}
        {player.isHost && (
          <div className="absolute top-2 left-2 z-[999] pointer-events-none">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,138,0,1)] select-none">🐾</span>
          </div>
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