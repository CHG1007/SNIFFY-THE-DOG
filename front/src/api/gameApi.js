import axios from 'axios';

// AI 분석 결과를 가져오는 함수입니다.
export const getAiAnalysis = async (gameHistoryId) => {
  try {
    // 자바 컨트롤러의 @GetMapping("/{gameHistoryId}") 주소로 요청을 보냅니다.
    const response = await axios.get(`/api/gamelog/${gameHistoryId}`);
    return response.data; // 서버에서 준 ApiResponse<MyGameLogResult>가 담깁니다.
  } catch (error) {
    console.error("AI 분석 데이터를 가져오는 데 실패했습니다.", error);
    return { success: false };
  }
};