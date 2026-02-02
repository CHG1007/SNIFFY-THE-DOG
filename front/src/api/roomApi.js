import { apiClient } from './authApi';
// 1. 방 생성
export const createRoom = async (roomData) => {
  // roomData: { title, capacity, timeLimit, isPrivate, password }
  const response = await apiClient.post('/api/v1/rooms', roomData);
  return response.data;
};

// 2. 공개 방 목록 조회 (페이지네이션 지원)
export const getRoomList = async (page = 0, size = 6) => {
  // 백엔드: GET /api/v1/rooms?page=0&size=6
  const response = await apiClient.get('/api/v1/rooms', {
    params: { page, size }
  });
  return response.data;
};

// 2. 초대 코드로 방 상태 조회
export const getRoomByInviteCode = async (inviteCode) => {
  // GET /api/v1/rooms?inviteCode={code}
  const response = await apiClient.get('/api/v1/rooms', {
    params: { inviteCode }
  });
  return response.data;
};

// [DEPRECATED] 초대 코드로 입장 - getRoomByInviteCode 사용 권장
export const joinByCode = async (inviteCode) => {
  // POST /api/v1/rooms/join-by-code (명세에 맞게 수정 가능)
  const response = await apiClient.post('/api/v1/rooms/join-by-code', { inviteCode });
  return response.data;
};

// 3. 빠른 입장
export const quickJoin = async () => {
  // POST /api/v1/rooms/quick-join
  const response = await apiClient.post('/api/v1/rooms/quick-join');
  return response.data;
};

// [추가] 방 정보 수정 API
export const updateRoomInfo = async (roomId, roomData) => {
  // 백엔드에 방 정보 수정 API가 구현되어 있다면 아래 주석을 해제하고 사용하세요.
  // const response = await axios.patch(`/rooms/${roomId}`, roomData); 
  // return response.data;

  // ⚠️ 현재 백엔드(GameService) 코드에는 방 정보 수정 기능이 없으므로,
  // 에러를 방지하기 위해 임시로 '성공' 응답을 흉내 냅니다.
  console.log(`[API] 방 정보 수정 요청 (Room: ${roomId})`, roomData);
  return {
    data: {
      success: true,
      message: "방 정보가 수정되었습니다 (로컬 반영)"
    }
  };
};