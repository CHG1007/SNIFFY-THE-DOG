import axios from 'axios';
import useAuthStore from '../stores/useAuthStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
});

// 토큰 갱신 중인지 추적
let isRefreshing = false;
// 토큰 갱신 대기 중인 요청들
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 요청 인터셉터: accessToken을 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    console.log("🚀 [API 요청] URL:", config.url);
    console.log("🔑 [보내는 토큰]:", accessToken ? accessToken.substring(0, 10) + "..." : "없음(NULL) 😱");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // refresh 요청 자체가 실패한 경우 로그아웃
      if (originalRequest.url?.includes('/api/v1/auth/refresh')) {
        useAuthStore.getState().logout();
        window.location.href = '/';
        return Promise.reject(error);
      }

      // 이미 토큰 갱신 중인 경우 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        // 토큰 갱신 요청 (인터셉터를 거치지 않는 새 axios 인스턴스 사용)
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        // 새 토큰 저장
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        // 대기 중인 요청들 처리
        processQueue(null, newAccessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
