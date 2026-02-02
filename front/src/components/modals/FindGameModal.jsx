import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalWrapper from './ModalWrapper';
import TextInput from '../common/TextInput';
import apiClient from '../../api/apiClient';

const FindGameModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [inviteCode, setInviteCode] = useState("");
    const [error, setError] = useState("");

const handleJoin = async () => {
    // 1. 입력값 검증 (클라이언트 단)
    if (inviteCode.trim() === "") {
      setError("입장 코드를 입력해주세요.");
      return;
    }

    setError(""); // 이전 에러 초기화

    try {
      // 2. 백엔드 API 호출 (GET /api/v1/rooms)
      const response = await apiClient.get('/api/v1/rooms', {
        params: { 
          inviteCode: inviteCode.trim(),
          page: 0, 
          size: 1 
        }
      });

      // 3. 서버 응답 처리
      const { success, data, error: serverError } = response.data;

      if (success && data) {
        // 성공 시 해당 roomId로 이동
        const targetRoomId = data.roomId; 
        onClose();
        navigate(`/rooms/${targetRoomId}`, { state: { isHost: false } });
      } else {
        // 서버에서 논리적으로 거부한 경우 (예: 방 만원, 비활성 코드 등)
        setError(serverError?.message || "초대 코드가 유효하지 않습니다.");
      }

    } catch (err) {
      // 4. 네트워크 에러 및 서버 연결 실패 처리
      console.error("입장 처리 중 에러 발생:", err);
      
      // 튕김 현상이 발생한다면 apiClient 인터셉터 영향일 수 있으나, 
      // 로직상으로는 여기서 에러 메시지를 보여주는 것이 맞습니다.
      setError("서버와의 연결이 원활하지 않습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center w-full h-full pt-4">
        <h2 className="text-3xl font-black text-white pt-15 mb-4 tracking-widest text-center">
          게임 찾기
        </h2>

        <div className="w-full">
          <TextInput 
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value);
              if (e.target.value.trim() !== "") setError(""); // 타이핑 시작하면 에러 삭제
            }}
            placeholder="입장 코드를 입력해주세요"
            errorMsg={error} // 상태로 관리되는 error 전달
          />
        </div>

        <button 
          onClick={handleJoin} // 이제 이 함수에서 체크함
          className="w-full py-3 bg-[#ff8a00] hover:bg-[#ffaa44] text-white text-2xl font-black rounded-xl transition-all shadow-lg active:scale-95 mt-2"
        >
          입장 하기
        </button>
      </div>
    </ModalWrapper>
  );
};

export default FindGameModal;