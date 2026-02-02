import React from 'react';
import WaitingGrid from '../components/waiting/WaitingGrid';

const UserWaitingPage = ({ 
  players, 
  myId, 
  capacity,
  onReady // 레디 버튼 처리는 부모(WaitingRoomPage)가 하므로 Grid에는 필요 없을 수 있음 
          // (Grid 내부에서 onReady 버튼을 쓴다면 전달해야 함)
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-4 px-12">
      <div className="w-full max-w-[1200px] h-full">
        <WaitingGrid 
          players={players} 
          myId={myId} 
          isHost={false} 
          capacity={capacity} 
          // onReady는 WaitingRoomPage의 하단 바에서 처리하므로 Grid에는 전달 안 해도 됨
          // 만약 Grid 내부에 '준비' 버튼이 있다면 여기에 onReady={onReady} 추가
        />
      </div>
    </div>
  );
};

export default UserWaitingPage;