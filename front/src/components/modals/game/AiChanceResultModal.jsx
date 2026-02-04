const AiChanceResultModal = ({ isOpen, targetName, result, onClose }) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-black text-yellow-400 mb-8">AI 분석 결과</h1>
        <p className="text-xl text-white mb-4">
          {targetName}님
        </p>
        <div className="bg-black/50 rounded-xl p-6 mb-8 border border-yellow-500/30">
          <p className="text-lg text-gray-200">{result.summary}</p>
          {result.metrics && (
            <div className="mt-4 flex justify-center gap-8">
              <div>
                <span className="text-gray-400 text-sm">긴장도</span>
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round(result.metrics.tension * 100)}%
                </div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">신뢰도</span>
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(result.metrics.confidence * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-yellow-600 text-white font-bold rounded-full hover:bg-yellow-500 transition-all"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default AiChanceResultModal;
