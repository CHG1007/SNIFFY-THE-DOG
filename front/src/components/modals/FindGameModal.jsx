import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalWrapper from './ModalWrapper';
import TextInput from '../common/TextInput';

const FindGameModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [inviteCode, setInviteCode] = useState("");
    const [error, setError] = useState("");

  const handleJoin = async () => {
    if (inviteCode.trim() === "") {
      setError("입장 코드를 입력해주세요.");
    } else {
      setError("");
      
      try {
        /* 실제 API 호출(백엔드 연결 시 해당 코드 활용) :
          const response = await api.post('/api/v1/rooms/join-by-code', { inviteCode });
          const { success, data } = response.data;
        */

        // 임시 테스트용 가공 데이터
        const mockSuccess = true;
        const mockRoomId = "r_private_1"; // 서버에서 받아올 roomId

        if (mockSuccess) {
          console.log("입장 성공! 방 ID:", mockRoomId);
          onClose(); // 모달 닫기
          // API 명세서 경로를 고려하여 라우팅 이동
          // 브라우저 주소창은 /rooms/{roomId} 형식을 사용합니다.
          navigate(`/rooms/${mockRoomId}`, { state: { isHost: false } });
        }
      } catch (err) {
        setError("초대 코드가 존재하지 않거나 만료되었습니다.");
        console.error(err)
      }
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