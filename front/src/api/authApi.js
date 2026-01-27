import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

export const loginWithKakao = (token) =>
  apiClient.post("/api/v1/auth/kakao", {
    AccessToken: token,
  });
