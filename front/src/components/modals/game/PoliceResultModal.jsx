const PoliceResultModal = ({ isOpen, targetName, isMafia, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-center">
        <h1 className="text-4xl font-black text-blue-400 mb-8">수사 결과</h1>
        <p className="text-2xl text-white mb-6">
          {targetName}님은
        </p>
        <div className={`text-5xl font-black mb-12 ${isMafia ? 'text-red-500' : 'text-green-500'}`}>
          {isMafia ? '마피아입니다!' : '마피아가 아닙니다.'}
        </div>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-all"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default PoliceResultModal;
