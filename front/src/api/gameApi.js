import apiClient from './apiClient'; // 💡 직접 만든 apiClient를 가져옵니다.

// 1. [조회] 리포트 가져오기
export const getAiAnalysis = async (gameHistoryId) => {
  try {
    // 💡 apiClient를 쓰면 headers에 토큰을 직접 안 넣어도 알아서 붙여서 나갑니다!
    const response = await apiClient.get(`/api/gamelog/${gameHistoryId}`);
    return response.data;
  } catch (error) {
    console.error("조회 중 에러 발생:", error);
    throw error;
  }
};

// 2. [요청] 분석 시작 시키기
export const requestAiAnalysis = async (gameHistoryId) => {
  try {
    const response = await apiClient.post(`/api/gamelog/${gameHistoryId}/analyze`);
    return response.data;
  } catch (error) {
    console.error("분석 요청 중 에러 발생:", error);
    throw error;
  }
};