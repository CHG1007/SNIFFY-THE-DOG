import ModalWrapper from './ModalWrapper';
import ConfirmBtn from '../common/ConfirmBtn';

const LastBeggingModal = ({ isOpen, onClose, onConfirm, message }) => {
  const isConfirmType = Boolean(onConfirm);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="min-h-[280px]">
      <div className="flex flex-col items-center justify-center w-full h-full py-6">
        {/* 전달받은 메시지를 줄바꿈(\n) 처리하여 출력 */}
        <p className="text-2xl font-black text-white text-center leading-relaxed whitespace-pre-line mb-10">
          {message}
        </p>

        <div className="flex w-full gap-4 px-4">
          {/* 1. Yes/No가 필요한 '선택형'일 때만 Yes 버튼을 보여줌 */}
          {isConfirmType && (
            <ConfirmBtn 
              text="Yes" 
              className="flex-1 py-3 text-xl" 
              onClick={onConfirm} 
            />
          )}
          <ConfirmBtn 
            text="No" 
            variant="secondary" 
            className="flex-1 py-3 text-xl" 
            onClick={onClose} 
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default LastBeggingModal;