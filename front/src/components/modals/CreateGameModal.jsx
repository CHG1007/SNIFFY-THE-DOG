import { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import TextInput from "../common/TextInput";
import ConfirmBtn from "../common/ConfirmBtn";

  const CreateGameModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(6); // 기본 인원 6명
  const [isPrivate, setIsPrivate] = useState(false); // 비공개 여부
  const [error, setError] = useState("");

  // 2. 생성 버튼 클릭 시 유효성 검사 로직
  const handleCreate = () => {
    if (title.trim() === "") {
      setError("방 제목을 입력해주세요."); 
    } else {
      setError("");
      console.log("게임 생성 정보:", { title, maxPlayers, isPrivate });
      // 실제 구현 시 여기서 API 호출을 하고 성공하면 onClose()를 호출합니다.
      onClose(); 
    }
  };

  // 3. 인원 조절 함수 (4명 ~ 8명 제한)
  const changePlayers = (num) => {
    if (maxPlayers + num >= 4 && maxPlayers + num <= 8) {
      setMaxPlayers(maxPlayers + num);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center w-full h-full pt-4 text-white">
        <h2 className="text-3xl font-black mb-10 tracking-widest text-center">게임 생성</h2>

        {/* 1. 방 제목 입력 섹션 */}
        <div className="w-full flex items-center gap-4 mb-2">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left">방 제목</span>
          <TextInput 
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              // 글자를 입력하기 시작하면 에러 메시지 삭제
              if (e.target.value.trim() !== "") setError(""); 
            }}
            placeholder="방 제목을 입력해주세요"
            errorMsg={error}
          />
        </div>

        {/* 2. 인원 수 조절 섹션 */}
        <div className="w-full flex items-center gap-4 mb-6">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left">인원 수</span>
          <div className="flex items-center gap-4 bg-[#1a1a1a] p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => changePlayers(-1)}
              className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a] cursor-pointer"
            >-</button>
            <span className="text-2xl font-black w-8 text-center">{maxPlayers}</span>
            <button 
              onClick={() => changePlayers(1)}
              className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a] cursor-pointer"
            >+</button>
          </div>
        </div>

        {/* 3. 비공개 토글 섹션 */}
        <div className="w-full flex items-center gap-4 mb-10">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left">비공개</span>
          <button 
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-14 h-7 rounded-full relative transition-colors p-1 cursor-pointer ${isPrivate ? 'bg-[#ff8a00]' : 'bg-[#333333]'}`}
          >
            {/* 토글 스위치 내부 원 아이콘 */}
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform transform ${isPrivate ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* 4. 하단 버튼 영역 */}
        <div className="flex w-full gap-4">
          <ConfirmBtn 
            text="생성" 
            className="flex-1 text-xl py-3" 
            onClick={handleCreate} // 💡 위에서 만든 handleCreate 연결
          />
          <ConfirmBtn 
            text="취소" 
            variant="secondary" 
            className="flex-1 text-xl py-3" 
            onClick={onClose} 
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateGameModal;