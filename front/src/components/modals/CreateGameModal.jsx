import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { createRoom } from '../../api/roomApi';
import useAuthStore from '../../stores/useAuthStore';
import { useRoomEntry } from '../../hooks/useRoomEntry';
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
  const { enterRoom } = useRoomEntry();
  const userNickname = useAuthStore((state) => state.nickname || state.user?.nickname || "익명 유저");

  const [title, setTitle] = useState(initialData?.title || '');
  const [capacity, setCapacity] = useState(initialData?.capacity || 6); 
  const [isPrivate, setIsPrivate] = useState(initialData?.isPrivate || false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // 방장이 아니면 읽기 전용
  const isReadOnly = isEdit && !isHost;

  const handleAction = async () => {
    if (isReadOnly) {
      onClose();
      return;
    }

    if (!title.trim()) {
      setError("방 제목을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      if (isEdit) {
        if (onSave) {
          // 수정 시에는 제목, 인원, 비공개 여부만 전달
          await onSave({ title, capacity, isPrivate });
        }
        onClose();
      } else {
        // ✅ [수정] 백엔드 RoomController 스펙에 맞춰 password 제거
        const payload = {
          title: title,
          capacity: capacity,
          timeLimit: 60,
          isPrivate: isPrivate, // boolean 값 전송
          developerMode: false, 
          clientType: "WEB",
          hostDisplayName: userNickname
        };

        const response = await createRoom(payload);
        
        // ✅ [수정] 응답에서 roomId와 inviteCode 추출
        const roomId = response.data?.roomId || response.data?.id;
        const receivedInviteCode = response.data?.inviteCode; // 백엔드가 보내준 초대 코드

        if (roomId) {
          onClose();
          // ✅ [핵심] 대기방으로 inviteCode와 비공개 여부를 명확히 전달
          enterRoom(roomId, true, {
            createdData: {
              title,
              capacity,
              isPrivate
            },
            inviteCode: receivedInviteCode // 여기서 넘겨줘야 대기방 설정에서 바로 보임
          });
        } else {
          setError("방 생성에 실패했습니다 (ID 누락).");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "요청에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const changeCapacity = (num) => {
    if (isReadOnly) return;
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

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center w-full h-full pt-4 text-white">
        <div className="flex justify-between items-center w-full mb-6">
           <h2 className="text-3xl font-black tracking-widest text-center flex-1 ml-8">
             {isEdit ? "ROOM INFO" : "GAME CREATE"}
           </h2>
        </div>

        {/* 초대 코드 표시 (수정 모드 + 비공개 방일 때) */}
        {isEdit && isPrivate && inviteCode && (
          <div className="w-full flex items-center gap-4 mb-6">
             <span className="text-xl font-bold w-20 flex-shrink-0 text-left text-[#ff8a00]">CODE</span>
             <div className="flex-1 flex items-center justify-between bg-black/30 rounded-lg px-4 py-2 border border-white/10">
                <span className="text-xl font-mono tracking-widest text-orange-400 font-bold">{inviteCode}</span>
                <button 
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 group"
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
            onChange={(e) => setTitle(e.target.value)}
            placeholder="방 제목"
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
              <button onClick={() => changeCapacity(-1)} className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a]">-</button>
            )}
            <span className={`text-2xl font-black w-8 text-center ${isReadOnly ? 'mx-2' : ''}`}>{capacity}</span>
            {!isReadOnly && (
              <button onClick={() => changeCapacity(1)} className="w-10 h-10 flex items-center justify-center bg-[#2a2a2a] rounded-lg text-2xl hover:bg-[#3a3a3a]">+</button>
            )}
          </div>
          <span className="text-gray-500 text-sm font-bold ml-2">(6 ~ 8 Players)</span>
        </div>

        {/* 3. 비공개 여부 */}
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
            {isPrivate ? "비공개 방" : "공개 방"}
          </span>
        </div>

        {/* 4. 버튼 영역 */}
        <div className="flex w-full gap-4 mt-auto mb-4">
          {isHost ? (
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