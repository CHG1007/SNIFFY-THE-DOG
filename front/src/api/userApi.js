import apiClient from './apiClient';

export const getMyProfile = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data;
};

export const getUserBadges = async () => {
  const response = await apiClient.get('/api/users/me/badges');
  return response.data;
};

export const getUserGameHistory = async (page = 0, size = 10) => {
  const response = await apiClient.get('/api/users/me/games', {
    params: { page, size },
  });
  return response.data;
};

export const updateNickname = async (nickname) => {
  const response = await apiClient.put('/api/users/me/nickname', { nickname });
  return response.data;
};
