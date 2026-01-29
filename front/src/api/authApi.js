import axios from 'axios';
import apiClient from './apiClient';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

// 로그인은 토큰이 필요없으므로 별도 인스턴스 사용
const authClient = axios.create({ baseURL });

export const loginWithKakao = (token) =>
  authClient.post('/api/v1/auth/kakao', {
    AccessToken: token,
  });

export const refreshToken = (refreshToken) =>
  authClient.post('/api/v1/auth/refresh', {
    refreshToken,
  });

export const logout = () =>
  apiClient.post('/api/v1/auth/logout');
