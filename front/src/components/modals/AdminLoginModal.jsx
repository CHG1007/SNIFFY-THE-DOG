import { useState } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import { adminLogin } from '../../api/authApi';
import ModalWrapper from './ModalWrapper';
import TextInput from '../common/TextInput';

const AdminLoginModal = ({ isOpen, onClose }) => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const loginAsAdmin = useAuthStore((state) => state.loginAsAdmin);

  const handleLogin = async () => {
    setErrorMsg('');
    try {
      const response = await adminLogin(id, pw);
      console.log("Admin Login Response:", response.data); // 디버깅용 로그

      // OnboardingPage.jsx와 AdminPage.jsx의 응답 구조가 다를 수 있어 유연하게 처리
      const { status, success, data } = response.data;

      // 1. status가 'SUCCESS' 이거나
      // 2. success가 true 이거나
      // 3. HTTP 200이고 data가 존재하는 경우 (response.data 자체가 data일 수도 있으므로 주의 필요하지만, 여기선 data 프로퍼티 체크)
      if ((status === 'SUCCESS' || success === true) && data) {
        // 토큰 저장 및 상태 업데이트
        loginAsAdmin({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        
        onClose();
        // Reset fields
        setId('');
        setPw('');
      } else {
        setErrorMsg('로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      setErrorMsg('아이디 또는 비밀번호를 확인해주세요.');
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="h-auto min-h-[300px]">
      <div className="flex flex-col items-center justify-center gap-6 pt-4">
        <h2 className="text-2xl font-black text-white mb-4">관리자 로그인</h2>
        
        <div className="w-full flex flex-col gap-4">
          <TextInput 
            value={id} 
            onChange={(e) => setId(e.target.value)} 
            placeholder="아이디" 
          />
          
          <div className="w-full flex flex-col items-center gap-2">
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호"
              className="w-full bg-[#1a1a1a] border-1 border-primary rounded-xl px-4 py-4 text-white text-center text-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600 font-bold"
            />
            
            {/* 에러 메시지 표시 영역 */}
            <div className="h-4 w-full flex items-center justify-center px-2">
              <span className="text-red-500 text-sm font-bold">
                {errorMsg}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full bg-primary text-black font-black text-xl py-4 rounded-xl hover:bg-[#e67e00] transition-colors mt-2"
        >
          로그인
        </button>
      </div>
    </ModalWrapper>
  );
};

export default AdminLoginModal;