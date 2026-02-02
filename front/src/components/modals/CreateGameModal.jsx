import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check } from "lucide-react";
import ModalWrapper from "./ModalWrapper";
import TextInput from "../common/TextInput";
import ConfirmBtn from "../common/ConfirmBtn";

const CreateGameModal = ({ isOpen, onClose, initialData, isEdit = false, onSave, isHost = true, inviteCode }) => {
  const navigate = useNavigate();
  
  // initialData가 있을 때(수정 모드)와 없을 때(생성 모드)의 초기값 설정
  const [title, setTitle] = useState(initialData?.title || "");
  const [capacity, setCapacity] = useState(initialData?.capacity || 6);
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate || false); 
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // 랜덤 대문자+숫자 조합 생성 함수 (CreateGameModal 외부나 내부에 작성)
  // 서버 연결 시 가짜 초대 코드 로직은 삭제 예정
  const generateInviteCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleCreate = async () => {
    if (!isHost) {
      onClose();
      return;
    }

    if (title.trim() === "") {
      setError("방 제목을 입력해주세요."); 
      return;
    }

    try {
      if (isEdit) {
        // [수정 모드] 나중에 백엔드 PATCH API 연결 부분
        onSave({ title, capacity, private: isPrivate });
      } else {
      // [생성 모드] 명세서 3-3 API 연결 부분
      /*
      const response = await apiClient.post('/api/v1/rooms', {
        title,
        capacity,
        private: isPrivate, // Swagger 필드명에 맞춤
        hostUserId: 1 // 실제 유저 ID (현재는 임시)
      });
      
      const { success, data } = response.data;
      if (success) {
        navigate(`/rooms/${data.roomId}`, { 
          state: { isHost: true, createdData: data } 
        });
      }
      */
        
        const newInviteCode = generateInviteCode();
        const mockRoomId = "r_" + Math.random().toString(36).substr(2, 9);
        navigate(`/rooms/${mockRoomId}`, { state: { isHost: true, createdData: { title, capacity, inviteCode: newInviteCode, isPrivate } } });
      }
      onClose(); 
    } catch (err) {
      setError(isEdit ? "수정에 실패했습니다." : "방 생성에 실패했습니다.");
      console.error(err);
    }
  };

  const changeCapacity = (num) => {
    if (!isHost) return;
    const nextValue = capacity + num;
    if (nextValue >= 6 && nextValue <= 8) {
      setCapacity(nextValue);
    }
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const isReadOnly = isEdit && !isHost;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center w-full h-full pt-4 text-white">
        {/* 💡 isEdit에 따라 제목 변경 */}
        <h2 className="text-3xl font-black mb-6 tracking-widest text-center">
          {isEdit ? "방 정보" : "게임 생성"}
        </h2>

        {/* [NEW] 초대 코드 섹션 (수정/확인 모드일 때만 표시) */}
        {isEdit && inviteCode && (
          <div className="w-full flex items-center gap-4 mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
             <span className="text-lg font-bold w-20 flex-shrink-0 text-left pl-2">초대 코드</span>
             <div className="flex-1 flex items-center justify-between bg-black/30 rounded-lg px-4 py-2 border border-white/5">
                <span className="text-xl font-mono tracking-widest text-orange-400 font-bold">{inviteCode}</span>
                <button 
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 group"
                >
                  {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-gray-400 group-hover:text-white" />}
                  {isCopied && <span className="text-xs text-green-500 font-bold">Copied!</span>}
                </button>
             </div>
          </div>
        )}

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
            disabled={isReadOnly}
            className={isReadOnly ? "opacity-70 cursor-not-allowed" : ""}
          />
        </div>

        {/* 2. 인원 수 조절 섹션 (capacity) */}
        <div className="w-full flex items-center gap-4 mb-6">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left">인원 수</span>
          <div className={`flex items-center gap-4 bg-[#1a1a1a] p-1 rounded-xl border border-white/10 ${isReadOnly ? 'opacity-50' : ''}`}>
            {!isReadOnly && (
              <button 
                onClick={() => changeCapacity(-1)}
                className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a] cursor-pointer"
              >-</button>
            )}
            <span className={`text-2xl font-black w-8 text-center ${isReadOnly ? 'mx-4' : ''}`}>{capacity}</span>
            {!isReadOnly && (
              <button 
                onClick={() => changeCapacity(1)}
                className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a] cursor-pointer"
              >+</button>
            )}
          </div>
          {!isReadOnly && <span className="text-gray-500 text-sm">(6~8명 선택 가능)</span>}
        </div>

        {/* 3. 비공개 토글 섹션 */}
        <div className="w-full flex items-center gap-4 mb-10">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left">비공개</span>
          <button 
            onClick={() => !isReadOnly && setIsPrivate(!isPrivate)}
            disabled={isReadOnly}
            className={`w-14 h-7 rounded-full relative transition-colors p-1 ${!isReadOnly ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${isPrivate ? 'bg-[#ff8a00]' : 'bg-[#333333]'}`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform transform ${isPrivate ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* 4. 하단 버튼 영역 */}
        <div className="flex w-full gap-4">
          {/* Host Mode: 저장 / 취소 */}
          {!isReadOnly ? (
            <>
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
            </>
          ) : (
            /* Guest Mode: 닫기 Only */
            <ConfirmBtn 
              text="닫기" 
              variant="secondary" 
              className="w-full text-xl py-3" 
              onClick={onClose} 
            />
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateGameModal;
