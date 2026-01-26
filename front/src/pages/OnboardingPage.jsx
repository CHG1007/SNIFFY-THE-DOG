// src/pages/OnboardingPage.jsx
import { useState } from 'react';
import KakaoLogin from 'react-kakao-login';
import { useNavigate } from 'react-router-dom';
import { loginWithKakao } from '../api/authApi';
import OnboardingBtn from '../components/onboarding/OnboardingBtn';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || '';

const OnboardingPage = () => {
  const navigate = useNavigate();

  const [isKakaoAuthed, setIsKakaoAuthed] = useState(true);

  const handleKakaoSuccess = async (response) => {
    const token = response?.response?.access_token || '';

    if (!token) {
      console.error('Kakao access token missing.');
      setIsKakaoAuthed(false);
      return;
    }

    try {
      const result = await loginWithKakao(token);
      const { success, error } = result?.data || {};

      if (success) {
        setIsKakaoAuthed(true);
      } else {
        console.error('Kakao backend login failed:', error);
        setIsKakaoAuthed(false);
      }
    } catch (error) {
      console.error('Kakao login request failed:', error);
      setIsKakaoAuthed(false);
    }
  };

  const handleKakaoFail = (error) => {
    console.error('Kakao login failed:', error);
    setIsKakaoAuthed(false);
  };

  const handleStartGame = () => {
    navigate('/rooms');
  };

  const handleTutorial = () => {
    // 튜토리얼 페이지로 이동
    navigate('/tutorial');
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center">
      
      {/* 로고 섹션 */}
      <div className="mb-16 text-center">
        <h1 className="text-6xl font-black italic tracking-tighter">
          <span className="text-[#ff8a00]">SNIFFY</span>
          <span className="text-white ml-3">the DOG</span>
        </h1>
      </div>

      {/* 버튼 섹션: 정의한 함수들을 onClick에 연결 */}
      <div className="flex flex-col gap-6">
        {isKakaoAuthed ? (
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
          튜토리얼
        </OnboardingBtn>
      </div>
    </div>
  );
};

export default OnboardingPage;
