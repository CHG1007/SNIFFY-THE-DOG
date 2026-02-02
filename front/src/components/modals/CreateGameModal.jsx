import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react'; // 아이콘 추가
import { createRoom } from '../../api/roomApi'; // API 연동
import useAuthStore from '../../stores/useAuthStore'; // 닉네임 스토어
import ModalWrapper from './ModalWrapper';
import ConfirmBtn from '../common/ConfirmBtn';
import TextInput from '../common/TextInput';

const CreateGameModal = ({ 
  isOpen, 
  onClose, 
  initialData, 
  isEdit = false, 
  onSave, 
  isHost = true, 
  inviteCode 
}) => {
  const navigate = useNavigate();
  
  // 스토어에서 사용자 닉네임 가져오기
  const userNickname = useAuthStore((state) => state.nickname || state.user?.nickname || "익명 유저");

  // 상태 초기화 (수정 모드일 경우 initialData 사용)
  const [title, setTitle] = useState(initialData?.title || '');
  const [capacity, setCapacity] = useState(initialData?.capacity || 6); 
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate || false);
  const [password, setPassword] = useState(''); // 비밀번호는 보안상 초기화하지 않음 (생성/수정 시 입력)
  
  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // 읽기 전용 모드 확인 (수정 모드이면서 방장이 아닐 때)
  const isReadOnly = isEdit && !isHost;

  // 생성 및 저장 핸들러
  const handleAction = async () => {
    // 1. 읽기 전용이면 닫기
    if (isReadOnly) {
      onClose();
      return;
    }

    // 2. 유효성 검사
    if (!title.trim()) {
      setError("방 제목을 입력해주세요.");
      return;
    }
    // 생성 모드이거나, 수정 모드에서 비공개로 전환/유지 시 비밀번호 입력 체크
    if (!isEdit && isPrivate && !password.trim()) {
      setError("비공개 방은 비밀번호가 필수입니다.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      if (isEdit) {
        // [수정 모드] - 추후 백엔드 PATCH API 연결 혹은 상위 컴포넌트 처리
        if (onSave) {
          await onSave({ title, capacity, isPrivate, password });
        }
        onClose();
      } else {
        // [생성 모드] - 실제 API 호출
        const payload = {
          title: title,
          capacity: capacity,
          timeLimit: 60,
          isPrivate: isPrivate,
          password: isPrivate ? password : null,
          developerMode: false, 
          clientType: "WEB",
          hostDisplayName: userNickname
        };

        console.log("🚀 방 생성 요청 Payload:", payload);
        const response = await createRoom(payload);
        
        const roomId = response.data?.roomId || response.data?.roomCode || response.data?.id;

        if (roomId) {
          onClose();
          // ✅ [핵심 수정] 생성된 방 정보(createdData)를 대기방으로 넘겨줍니다.
          navigate(`/waiting-room/${roomId}`, { 
            state: { 
              isHost: true,
              createdData: { 
                title, 
                capacity, 
                isPrivate 
              }
            } 
          });
        } else {
          setError("방 생성에 성공했으나 입장 코드를 받지 못했습니다.");
        }
      }
    } catch (err) {
      console.error("요청 실패:", err);
      setError(err.response?.data?.message || (isEdit ? "수정에 실패했습니다." : "방 생성에 실패했습니다."));
    } finally {
      setIsLoading(false);
    }
  };

  // 인원 수 변경 핸들러
  const changeCapacity = (num) => {
    if (isReadOnly) return;
    const nextValue = capacity + num;
    if (nextValue >= 6 && nextValue <= 8) {
      setCapacity(nextValue);
    }
  };

  // 초대 코드 복사 핸들러
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

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center w-full h-full pt-4 text-white">
        <div className="flex justify-between items-center w-full mb-6">
           <h2 className="text-3xl font-black tracking-widest text-center flex-1 ml-8">
             {isEdit ? "ROOM INFO" : "GAME CREATE"}
           </h2>
        </div>

        {/* [NEW] 초대 코드 섹션 (수정/확인 모드일 때만 표시) */}
        {isEdit && inviteCode && (
          <div className="w-full flex items-center gap-4 mb-6">
             <span className="text-xl font-bold w-20 flex-shrink-0 text-left text-[#ff8a00]">CODE</span>
             <div className="flex-1 flex items-center justify-between bg-black/30 rounded-lg px-4 py-2 border border-white/10">
                <span className="text-xl font-mono tracking-widest text-orange-400 font-bold">{inviteCode}</span>
                <button 
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 group"
                  title="초대 코드 복사"
                >
                  {isCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-gray-400 group-hover:text-white" />}
                </button>
             </div>
          </div>
        )}

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
            disabled={isReadOnly}
            className={isReadOnly ? "opacity-70 cursor-not-allowed" : ""}
          />
        </div>

        {/* 2. 인원 수 */}
        <div className="w-full flex items-center gap-4 mb-6">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left text-[#ff8a00]">MAX</span>
          <div className={`flex items-center gap-4 bg-[#1a1a1a] p-1 rounded-xl border border-white/10 ${isReadOnly ? 'opacity-50' : ''}`}>
            {!isReadOnly && (
              <button 
                onClick={() => changeCapacity(-1)}
                className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a] cursor-pointer transition-colors"
              >-</button>
            )}
            <span className={`text-2xl font-black w-8 text-center ${isReadOnly ? 'mx-2' : ''}`}>{capacity}</span>
            {!isReadOnly && (
              <button 
                onClick={() => changeCapacity(1)}
                className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a] cursor-pointer transition-colors"
              >+</button>
            )}
          </div>
          {!isReadOnly && <span className="text-gray-500 text-sm font-bold ml-2">(6 ~ 8 Players)</span>}
        </div>

        {/* 3. 비공개 토글 */}
        <div className="w-full flex items-center gap-4 mb-8">
          <span className="text-xl font-bold w-20 flex-shrink-0 text-left text-[#ff8a00]">PRIVATE</span>
          <button 
            onClick={() => !isReadOnly && setIsPrivate(!isPrivate)}
            disabled={isReadOnly}
            className={`w-14 h-7 rounded-full relative transition-colors p-1 ${!isReadOnly ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${isPrivate ? 'bg-[#ff8a00]' : 'bg-[#333333]'}`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform transform ${isPrivate ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className="text-gray-400 text-sm">
            {isPrivate ? "비공개 방 (비밀번호 필요)" : "공개 방"}
          </span>
        </div>

        {/* 4. 비밀번호 (비공개일 때만 표시, 읽기 전용일 땐 숨김 처리 가능하나 여기선 유지) */}
        {isPrivate && !isReadOnly && (
          <div className="w-full flex items-center gap-4 mb-8 animate-fadeIn">
            <span className="text-xl font-bold w-20 flex-shrink-0 text-left text-[#ff8a00]">PW</span>
            <TextInput 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "변경할 비밀번호 (선택)" : "비밀번호를 입력하세요"}
            />
          </div>
        )}

        {/* 5. 버튼 영역 */}
        <div className="flex w-full gap-4 mt-auto mb-4">
          {!isReadOnly ? (
            <>
              <ConfirmBtn 
                text={isLoading ? "처리 중..." : (isEdit ? "SAVE" : "CREATE")} 
                className="flex-1 text-xl py-4 bg-[#ff8a00] hover:bg-[#ffaa44]" 
                onClick={handleAction} 
                disabled={isLoading}
              />
              <ConfirmBtn 
                text="CANCEL" 
                variant="secondary" 
                className="flex-1 text-xl py-4" 
                onClick={onClose} 
                disabled={isLoading}
              />
            </>
          ) : (
            <ConfirmBtn 
              text="CLOSE" 
              variant="secondary" 
              className="w-full text-xl py-4" 
              onClick={onClose} 
            />
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateGameModal;