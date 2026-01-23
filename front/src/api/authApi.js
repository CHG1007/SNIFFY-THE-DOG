import axios from "axios";

const apiClient = axios.create({
  baseURL: "",
});

export const loginWithKakao = (token) =>
  apiClient.post("/api/v1/auth/kakao", {
    AccessToken: token,
  });
