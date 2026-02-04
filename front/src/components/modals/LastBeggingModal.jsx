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

        <div className="flex w-full justify-center gap-4 px-4">
          {isConfirmType ? (
            // [선택형] Yes / No 버튼 2개
            <>
              <ConfirmBtn 
                text="Yes" 
                variant="primary"
                className="flex-1 py-3 text-xl" 
                onClick={onConfirm} 
              />
              <ConfirmBtn 
                text="No" 
                variant="secondary" 
                className="flex-1 py-3 text-xl" 
                onClick={onClose} 
              />
            </>
          ) : (
            // [알림형] Okay 버튼 1개 (길이를 줄이기 위해 w-48 등 고정폭 권장)
            <ConfirmBtn 
              text="Okay" 
              variant="primary"
              className="w-48 py-3 text-xl" 
              onClick={onClose} 
            />
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default LastBeggingModal;