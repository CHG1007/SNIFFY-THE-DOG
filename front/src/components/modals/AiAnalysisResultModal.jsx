import ModalWrapper from './ModalWrapper';
import ConfirmBtn from '../common/ConfirmBtn';

const AiAnalysisResultModal = ({ isOpen, result, onClose }) => {
  if (!isOpen || !result) return null;

  const displayName = result.targetNickname || result.identity || "알 수 없는 유저";

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="min-h-[320px] max-w-lg">
      <div className="flex flex-col items-center justify-center w-full h-full py-4">
        
        {/* 헤더 부분: LastBeggingModal의 텍스트 스타일 반영 */}
        <h1 className="text-3xl font-black text-primary mb-2 tracking-tighter">
          AI 분석 결과
        </h1>
        
        <p className="text-xl font-bold text-white mb-6">
          {displayName}님에 대한 분석
        </p>

        {/* 결과 박스: LastBeggingModal의 subMessage 박스 스타일 반영 */}
        <div className="w-full bg-black/20 p-8 rounded-2xl border border-white/5 mb-8 shadow-inner">
          <p className="text-lg text-white leading-relaxed text-center whitespace-pre-wrap break-keep font-medium">
            {result.narrative}
          </p>
        </div>
        
        {/* 버튼 부분: ConfirmBtn 사용 */}
        <div className="flex w-full justify-center px-4">
          <ConfirmBtn 
            text="확인" 
            variant="primary"
            className="w-48 py-3 text-xl font-bold" 
            onClick={onClose} 
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default AiAnalysisResultModal;