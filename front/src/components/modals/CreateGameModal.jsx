import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../../api/roomApi';
import useAuthStore from '../../stores/useAuthStore'; // ✅ 닉네임 가져오기 위해 추가
import ModalWrapper from './ModalWrapper';
import XBtn from '../common/XBtn';
import ConfirmBtn from '../common/ConfirmBtn';
import TextInput from '../common/TextInput';

const CreateGameModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // 스토어에서 사용자 닉네임 가져오기 (없으면 '익명' 처리)
  const userNickname = useAuthStore((state) => state.nickname || state.user?.nickname || "익명 유저");

  // 폼 상태
  const [title, setTitle] = useState('');
  const [capacity, setCapacity] = useState(6); 
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  
  // 로딩 & 에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    // 1. 유효성 검사
    if (!title.trim()) {
      setError("방 제목을 입력해주세요.");
      return;
    }
    if (isPrivate && !password.trim()) {
      setError("비공개 방은 비밀번호가 필수입니다.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // 2. API 요청 데이터 구성 (백엔드 스펙 준수)
      const payload = {
        title: title,
        capacity: capacity,
        timeLimit: 60,       // 게임 제한 시간 (기본값)
        isPrivate: isPrivate,
        password: isPrivate ? password : null,
        
        // ✅ [필수] 백엔드 에러 방지용 필드들
        developerMode: false, 
        clientType: "WEB",
        hostDisplayName: userNickname // 👈 아까 에러난 원인 해결!
      };

      console.log("🚀 방 생성 요청 Payload:", payload);

      // 3. API 호출
      const response = await createRoom(payload);
      
      // 4. 응답 처리
      // 백엔드 응답 구조에 따라 roomId 추출 (유연하게 처리)
      const roomId = response.data?.roomId || response.data?.roomCode || response.data?.id;

      if (roomId) {
        onClose();
        // 방장 권한(isHost: true)을 가지고 대기방으로 이동
        navigate(`/waiting-room/${roomId}`, { state: { isHost: true } });
      } else {
        console.error("응답에 roomId가 없습니다:", response);
        setError("방 생성에 성공했으나 입장 코드를 받지 못했습니다.");
      }

    } catch (err) {
      console.error("방 생성 실패:", err);
      // 서버에서 보내준 에러 메시지가 있으면 보여줌
      setError(err.response?.data?.message || "방 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 인원 수 변경 핸들러
  const changeCapacity = (num) => {
    const nextValue = capacity + num;
    if (nextValue >= 6 && nextValue <= 8) {
      setCapacity(nextValue);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center w-full h-full pt-4 text-white">
        <div className="flex justify-between items-center w-full mb-8">
           <h2 className="text-3xl font-black tracking-widest text-center flex-1 ml-8">
             GAME CREATE
           </h2>
        </div>

        {/* 1. 방 제목 */}
        <div className="w-full flex items-center gap-4 mb-4">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left text-[#ff8a00]">TITLE</span>
          <TextInput 
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim() !== "") setError(""); 
            }}
            placeholder="방 제목을 입력해주세요"
            errorMsg={error}
          />
        </div>

        {/* 2. 인원 수 */}
        <div className="w-full flex items-center gap-4 mb-6">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left text-[#ff8a00]">MAX</span>
          <div className="flex items-center gap-4 bg-[#1a1a1a] p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => changeCapacity(-1)}
              className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a] cursor-pointer transition-colors"
            >-</button>
            <span className="text-2xl font-black w-8 text-center">{capacity}</span>
            <button 
              onClick={() => changeCapacity(1)}
              className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a] cursor-pointer transition-colors"
            >+</button>
          </div>
          <span className="text-gray-500 text-sm font-bold ml-2">(6 ~ 8 Players)</span>
        </div>

        {/* 3. 비공개 토글 */}
        <div className="w-full flex items-center gap-4 mb-8">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left text-[#ff8a00]">PRIVATE</span>
          <button 
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-14 h-7 rounded-full relative transition-colors p-1 cursor-pointer ${isPrivate ? 'bg-[#ff8a00]' : 'bg-[#333333]'}`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform transform ${isPrivate ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className="text-gray-400 text-sm">
            {isPrivate ? "비공개 방 (비밀번호 필요)" : "공개 방"}
          </span>
        </div>

        {/* 4. 비밀번호 (비공개일 때만 표시) */}
        {isPrivate && (
          <div className="w-full flex items-center gap-4 mb-8 animate-fadeIn">
            <span className="text-xl font-bold w-20 flex-shrink-0 text-left text-[#ff8a00]">PW</span>
            <TextInput 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
          </div>
        )}

        {/* 5. 버튼 영역 */}
        <div className="flex w-full gap-4 mt-auto mb-4">
          <ConfirmBtn 
            text={isLoading ? "생성 중..." : "CREATE"} 
            className="flex-1 text-xl py-4 bg-[#ff8a00] hover:bg-[#ffaa44]" 
            onClick={handleCreate} 
            disabled={isLoading}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateGameModal;