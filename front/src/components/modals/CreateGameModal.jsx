import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalWrapper from "./ModalWrapper";
import TextInput from "../common/TextInput";
import ConfirmBtn from "../common/ConfirmBtn";

const CreateGameModal = ({ isOpen, onClose, initialData, isEdit = false }) => {
  const navigate = useNavigate();
  
  // initialData가 있을 때(수정 모드)와 없을 때(생성 모드)의 초기값 설정
  const [title, setTitle] = useState(initialData?.title || "");
  const [capacity, setCapacity] = useState(initialData?.capacity || 6);
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate || false); 
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (title.trim() === "") {
      setError("방 제목을 입력해주세요."); 
      return;
    }

    try {
      if (isEdit) {
        // [수정 모드] 나중에 백엔드 PATCH API 연결 부분
        /* const response = await api.patch(`/api/v1/rooms/${initialData.roomId}`, { title, capacity, isPrivate }); 
        */
        console.log("방 정보 수정 완료:", { title, capacity, isPrivate });
      } else {
        // [생성 모드] 명세서 3-3 API 연결 부분
        /* const response = await api.post('/api/v1/rooms', { title, capacity, isPrivate, developerMode: false }); 
        */
        const mockRoomId = "r_abc";
        navigate(`/rooms/${mockRoomId}`, { state: { isHost: true } });
      }
      onClose(); 
    } catch (err) {
      setError(isEdit ? "수정에 실패했습니다." : "방 생성에 실패했습니다.");
      console.error(err);
    }
  };


  const changeCapacity = (num) => {
    const nextValue = capacity + num;
    if (nextValue >= 6 && nextValue <= 8) {
      setCapacity(nextValue);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center w-full h-full pt-4 text-white">
        {/* 💡 isEdit에 따라 제목 변경 */}
        <h2 className="text-3xl font-black mb-10 tracking-widest text-center">
          {isEdit ? "방 정보 수정" : "게임 생성"}
        </h2>

        {/* 1. 방 제목 입력 섹션 */}
        <div className="w-full flex items-center gap-4 mb-2">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left">방 제목</span>
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

        {/* 2. 인원 수 조절 섹션 (capacity) */}
        <div className="w-full flex items-center gap-4 mb-6">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left">인원 수</span>
          <div className="flex items-center gap-4 bg-[#1a1a1a] p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => changeCapacity(-1)}
              className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a] cursor-pointer"
            >-</button>
            <span className="text-2xl font-black w-8 text-center">{capacity}</span>
            <button 
              onClick={() => changeCapacity(1)}
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
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform transform ${isPrivate ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* 4. 하단 버튼 영역 - 💡 isEdit에 따라 텍스트 변경 */}
        <div className="flex w-full gap-4">
          <ConfirmBtn 
            text={isEdit ? "저장" : "생성"} 
            className="flex-1 text-xl py-3" 
            onClick={handleCreate} 
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