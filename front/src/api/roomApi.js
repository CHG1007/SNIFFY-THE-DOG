import { apiClient } from './authApi';
// 1. 방 생성
export const createRoom = async (roomData) => {
  // roomData: { title, capacity, timeLimit, isPrivate, password }
  const response = await apiClient.post('/api/v1/rooms', roomData);
  return response.data; 
};

// 2. 공개 방 목록 조회 (페이지네이션 지원)
export const getRoomList = async (page = 0, size = 10) => {
  // 백엔드: GET /api/v1/rooms?page=0&size=10
  const response = await apiClient.get('/api/v1/rooms', {
    params: { page, size }
  });
  return response.data; 
};

// 2. 초대 코드로 입장 (게임 찾기)
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