import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import CreatorWaitingPage from './CreatorWaitingPage';
import UserWaitingPage from './UserWaitingPage';
import LoadingPage from './LoadingPage';
import GamePage from './GamePage';

const WaitingRoomPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [roomData, setRoomData] = useState(null);
  
  // 상태 관리: 'WAITING' | 'STARTING' | 'PLAYING'
  const [status, setStatus] = useState('WAITING'); 
  // navigate에서 보낸 state가 있으면 사용, 없으면 기본값 false
  const amIHost = location.state?.isHost || false;
  // 방장이 수정 버튼 클릭 시 데이터 업데이트
  const updateRoomData = (newData) => {
    setRoomData(prev => ({
      ...prev,
      ...newData // 넘겨받은 제목, 인원수 등을 기존 데이터에 덮어씌움
    }));
  };

  // 게임 시작 함수 (카운트다운 완료 시 호출)
  const handleGameStart = () => {
    setStatus('STARTING'); // 로딩 화면으로 전환
    setTimeout(() => {
      setStatus('PLAYING'); // 2초 후 실제 게임 화면으로 전환
    }, 2000);
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
          // 이미지는 추후 수정해야 함
          { userId: 1, displayName: "태환", ready: true, isHost: true, photo: "https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/202302/11/9e7b87f1-2ca5-45af-ac7b-358ad794b1bc.jpg" },
          { userId: 2, displayName: "유저2", ready: true, isHost: false, photo: "https://img.vogue.co.kr/vogue/2023/10/style_65387f34c898c-930x1203.jpg" },
          { userId: 3, displayName: "루피", ready: true, isHost: false, photo: "https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/202302/11/9e7b87f1-2ca5-45af-ac7b-358ad794b1bc.jpg" }, 
          { userId: 4, displayName: "조로", ready: true, isHost: false, photo: "https://img.vogue.co.kr/vogue/2023/10/style_65387f34c898c-930x1203.jpg" }, 
          { userId: 5, displayName: "나미", ready: true, isHost: false, photo: "https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/202302/11/9e7b87f1-2ca5-45af-ac7b-358ad794b1bc.jpg" }, 
          { userId: 6, displayName: "상디", ready: true, isHost: false, photo: "https://img.vogue.co.kr/vogue/2023/10/style_65387f34c898c-930x1203.jpg" },
  
        ]
      };
      setRoomData(mockData);
    };
    
    setTimeout(fetchRoomData, 1000); 
  }, [roomId, amIHost, location.state]);

  // 데이터가 아직 없을 때(null) 로딩 페이지
  if (!roomData) {
    return <LoadingPage />;
  }

  // 게임 시작 전 로딩 (직업 배정 연출)
  if (status === 'STARTING') {
    return <LoadingPage message="Assigning Roles..." subMessage="당신의 정체를 숨기고 배신자를 찾으십시오." />;
  }

  // 실제 게임 화면
  // photo는 추후 삭제 예정
  if (status === 'PLAYING') {
    return <GamePage players={roomData.players.map(p => ({ id: p.userId, name: p.displayName, ready: p.ready, photo: p.photo  }))} myId={1} />;
  }

  // 판단 결과에 따라 미리 만들어둔 컴포넌트로 데이터를 토스(Toss)
  return amIHost ? (
    <CreatorWaitingPage roomData={roomData} updateRoomData={updateRoomData} onGameStart={handleGameStart} />
  ) : (
    <UserWaitingPage roomData={roomData} onGameStart={handleGameStart} />
  );
};

export default WaitingRoomPage;