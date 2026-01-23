import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import CreatorWaitingPage from './CreatorWaitingPage';
import UserWaitingPage from './UserWaitingPage';
import LoadingPage from './LoadingPage';

const WaitingRoomPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [roomData, setRoomData] = useState(null);
  
  // navigate에서 보낸 state가 있으면 사용, 없으면 기본값 false
  const amIHost = location.state?.isHost || false;
  // 방장이 수정 버튼 클릭 시 데이터 업데이트
  const updateRoomData = (newData) => {
    setRoomData(prev => ({
      ...prev,
      ...newData // 넘겨받은 제목, 인원수 등을 기존 데이터에 덮어씌움
    }));
  };

  useEffect(() => {
    // API 명세서: 방 상세 조회 호출 시뮬레이션
    const fetchRoomData = () => {
      const createdData = location.state?.createdData;
      
      const mockData = {
        roomId: roomId,
        title: createdData?.title || "같이 즐겜해요~",
        hostUserId: amIHost ? 1 : 2, // 방장의 ID
        capacity: createdData?.capacity || 8,
        inviteCode: "PKDIEJDL21443",
        players: [
          { userId: 1, displayName: "태환", ready: true },
          { userId: 2, displayName: "유저2", ready: false },
          { userId: 3, displayName: "루피", ready: true },   
          { userId: 4, displayName: "조로", ready: false },  
          { userId: 5, displayName: "나미", ready: true },   
          { userId: 6, displayName: "상디", ready: false },  
  
        ]
      };
      setRoomData(mockData);
    };
    
    setTimeout(fetchRoomData, 1000); 
  }, [roomId, amIHost, location.state]);

  // 데이터가 아직 없을 때 (null일 때) 로딩 페이지를 보여줍니다.
  if (!roomData) {
    return <LoadingPage />;
  }

  // 판단 결과에 따라 미리 만들어둔 컴포넌트로 데이터를 토스(Toss)
  return amIHost ? (
    <CreatorWaitingPage roomData={roomData} updateRoomData={updateRoomData} />
  ) : (
    <UserWaitingPage roomData={roomData} />
  );
};

export default WaitingRoomPage;