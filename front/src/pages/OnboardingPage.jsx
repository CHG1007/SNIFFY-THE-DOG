import { useState } from 'react';
import KakaoLogin from 'react-kakao-login';
import { useNavigate } from 'react-router-dom';
import { loginWithKakao } from '../api/authApi';
import useAuthStore from '../stores/useAuthStore';
import OnboardingBtn from '../components/onboarding/OnboardingBtn';
import AdminLoginModal from '../components/modals/AdminLoginModal';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || '';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const handleKakaoSuccess = async (response) => {
    const token = response?.response?.access_token || '';

    if (!token) {
      console.error('Kakao access token missing.');
      return;
    }

    try {
      const result = await loginWithKakao(token);
      const { success, data, error } = result?.data || {};

      if (success && data) {
        login({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });
      } else {
        console.error('Kakao backend login failed:', error);
      }
    } catch (error) {
      console.error('Kakao login request failed:', error);
    }
  };

  const handleKakaoFail = (error) => {
    console.error('Kakao login failed:', error);
  };

  const handleStartGame = () => {
    navigate('/rooms');
  };

  const handleTutorial = () => {
    // 튜토리얼 페이지로 이동
    navigate('/tutorial');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <img
        src="/assets/images/onboarding/background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      {/* 관리자 로그인 트리거 (좌측 하단 투명 영역) */}
      <div 
        className="fixed bottom-0 left-0 w-24 h-24 z-[9999]"
        onDoubleClick={() => setIsAdminModalOpen(true)}
      />

      <AdminLoginModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
      />
      
      {/* 로고 섹션 */}
      <div className="mb-16 text-center relative z-10">
        <h1 className="text-6xl font-black italic tracking-tighter">
          <img
            src="/assets/images/onboarding/title.png"
            alt="Mafia Logo"
            className="w-170 mx-auto mb-4"
            decoding="async"
          />
        </h1>
      </div>

      {/* 버튼 섹션: 정의한 함수들을 onClick에 연결 */}
      <div className="flex flex-col gap-6 relative z-10">
        {isAuthenticated ? (
          <OnboardingBtn type="primary" onClick={handleStartGame}>
            게임 시작하기
          </OnboardingBtn>
        ) : (
          <KakaoLogin
            token={KAKAO_JS_KEY}
            onSuccess={handleKakaoSuccess}
            onFail={handleKakaoFail}
            render={(renderProps) => (
              <OnboardingBtn type="primary" onClick={renderProps.onClick}>
                카카오로 시작하기
              </OnboardingBtn>
            )}
          />
        )}
        
        <OnboardingBtn type="outline" onClick={handleTutorial}>
          튜토리얼 시작하기
        </OnboardingBtn>
      </div>
    </div>
  );
};

export default OnboardingPage;
