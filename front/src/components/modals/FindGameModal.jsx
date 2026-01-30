import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinByCode } from '../../api/roomApi'; // ✅ API import
import ModalWrapper from './ModalWrapper';
import TextInput from '../common/TextInput';

const FindGameModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [inviteCode, setInviteCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (inviteCode.trim() === "") {
      setError("입장 코드를 입력해주세요.");
      return;
    } 
    
    try {
        setIsLoading(true);
        setError("");

        // ✅ 실제 API 호출
        const response = await joinByCode(inviteCode);
        
        // 응답에서 roomId 추출
        const roomId = response.data?.roomId || response.data?.roomCode;

        if (roomId) {
            onClose();
            // 대기방으로 이동 (waiting-room 경로 사용 권장)
            navigate(`/waiting-room/${roomId}`, { state: { isHost: false } });
        } else {
            throw new Error("방 정보를 찾을 수 없습니다.");
        }

    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "초대 코드가 존재하지 않거나 만료되었습니다.");
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
              if (e.target.value.trim() !== "") setError("");
            }}
            placeholder="입장 코드를 입력해주세요"
            errorMsg={error} 
          />
        </div>

        <button 
          onClick={handleJoin}
          disabled={isLoading}
          className="w-full py-3 bg-[#ff8a00] hover:bg-[#ffaa44] disabled:bg-gray-600 text-white text-2xl font-black rounded-xl transition-all shadow-lg active:scale-95 mt-2 cursor-pointer"
        >
          {isLoading ? "입장 중..." : "입장 하기"}
        </button>
      </div>
    </ModalWrapper>
  );
};

export default FindGameModal;