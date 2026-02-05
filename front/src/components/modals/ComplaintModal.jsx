import { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import ConfirmBtn from "../common/ConfirmBtn";

const ComplaintModal = ({
  isOpen,
  onClose,
  targetName = "OO",
  onSubmit,
  submitting = false,
  submitError = "",
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const maxLength = 255;

  const handleReport = async () => {
    if (reason.trim() === "") {
      setError("신고 이유를 작성해주세요.");
    } else {
      setError("");
      if (onSubmit) {
        try {
          await onSubmit(reason);
        } catch (err) {
          setError("Report failed. Please try again.");
        }
        return;
      }
      console.log(`${targetName}님 신고 사유:`, reason);
      // 서버 통신 로직 후 성공 시 onClose()
      onClose();
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center w-full h-full pt-4 text-white">
        {/* 1. 타이틀 영역 */}
        <h2 className="text-3xl font-black mb-2 tracking-widest text-center">신고 하기</h2>
        <p className="text-lg font-medium mb-6 text-center">{targetName}님을 신고하시겠습니까?</p>

        {/* 2. 신고 내용 입력 (TextArea) */}
        <div className="w-full relative mb-2">
          <textarea
            value={reason}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setReason(e.target.value);
                if (e.target.value.trim() !== "") setError("");
              }
            }}
            placeholder="신고 이유를 작성해 주세요."
            className="w-full h-40 bg-[#1a1a1a] border-2 border-primary rounded-xl p-4 text-white text-lg outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600 resize-none"
          />
          {/* 글자 수 표시 (우측 하단) */}
          <span className="absolute bottom-4 right-4 text-gray-500 text-sm">
            {reason.length} / {maxLength}
          </span>
        </div>

        {/* 3. 에러 메시지 영역 (공간 고정) */}
        <div className="min-h-[24px] w-full flex items-center px-2 mb-6">
          {(error || submitError) && (
            <span className="text-red-600 text-sm font-bold">
              {submitError || error}
            </span>
          )}
        </div>

        {/* 4. 하단 버튼 영역 (게임 생성과 동일한 위치) */}
        <div className="flex w-full gap-4">
          <ConfirmBtn 
            text="신고" 
            className="flex-1 text-xl py-3" 
            onClick={handleReport} 
            disabled={submitting}
          />
          <ConfirmBtn 
            text="취소" 
            variant="secondary" 
            className="flex-1 text-xl py-3" 
            onClick={onClose} 
            disabled={submitting}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ComplaintModal;