import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomByInviteCode } from '../../api/roomApi';
import { useRoomEntry } from '../../hooks/useRoomEntry';
import ModalWrapper from './ModalWrapper';
import TextInput from '../common/TextInput';

const FindGameModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { enterRoom } = useRoomEntry();

const handleJoin = async () => {
    // 1. 입력값 검증 (클라이언트 단)
    if (inviteCode.trim() === "") {
      setError("입장 코드를 입력해주세요.");
      return;
    }
    try {
      setIsLoading(true);
      setError("");

      // 1. 초대 코드로 방 정보 조회 (REST API)
      const response = await getRoomByInviteCode(inviteCode);
      const roomData = response.data;

      if (!roomData) {
        throw new Error("방 정보를 찾을 수 없습니다.");
      }

      // 2. 입장 가능 여부 확인 (방 상태 체크)
      if (roomData.status !== 'WAITING') {
        if (roomData.status === 'PLAYING') {
          setError("이미 게임이 진행 중인 방입니다.");
        } else if (roomData.status === 'ENDED') {
          setError("이미 종료된 방입니다.");
        } else {
          setError("현재 입장할 수 없는 방입니다.");
        }
        return;
      }

      // 3. 입장 로직 시작 (WSS 연결을 위한 페이지 이동)
      onClose();
      enterRoom(roomData.roomId, false);

    } catch (err) {
      console.error("Join Error:", err);
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