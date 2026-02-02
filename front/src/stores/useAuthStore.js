import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: !!accessToken });
      },

      setUser: (user) => {
        set({ user });
      },

      login: ({ accessToken, refreshToken, user }) => {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
        });
      },

      loginAsAdmin: ({ accessToken, refreshToken }) => {
        set({
          isAuthenticated: true,
          user: {
            nickname: 'GM_Sniffy',
            role: 'ADMIN',
            id: 0,
            isAdmin: true, // 프론트 편의상 유지
            profileImage: null,
          },
          accessToken,
          refreshToken,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
