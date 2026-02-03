import React from 'react';

const FutureReportModal = ({ isOpen, onClose, data }) => {
  // 데이터가 없거나 닫혀있으면 출력 안 함
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 p-4">
      <style>{`
        @keyframes openScroll { 0% { transform: scaleY(0); opacity: 0; } 100% { transform: scaleY(1); opacity: 1; } }
        @keyframes fadeInText { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .parchment-scroll { animation: openScroll 1.2s ease-out forwards; background: #f4e4bc; box-shadow: 0 0 50px rgba(0,0,0,0.5), inset 0 0 100px #d4a373; }
        .fade-in-item { opacity: 0; animation: fadeInText 0.8s ease-out forwards; }
      `}</style>

      <div className="parchment-scroll relative w-full max-w-[600px] max-h-[85vh] overflow-y-auto rounded-sm p-10 text-center flex flex-col items-center">
        <div className="content mb-8">
          <h2 className="fade-in-item text-2xl font-bold text-[#4a3728] mb-8" style={{ animationDelay: '1.5s' }}>
            당신은 <span className="text-[#b22222]">{data.jobTitle}</span>였습니다!
          </h2>

          {data.stats.map((stat, idx) => (
            <div key={idx} className="fade-in-item mb-6 text-[#4a3728] leading-relaxed" style={{ animationDelay: `${2.0 + (idx * 0.5)}s` }}>
              <p className="text-lg">{stat.label}: <span className="text-[#b22222] font-bold">{stat.value}</span></p>
              <p className="text-sm opacity-80">{stat.desc}</p>
            </div>
          ))}

          <div className="fade-in-item mt-10 p-6 border-t border-[#d4a373] text-[#4a3728] italic whitespace-pre-line leading-loose font-medium" style={{ animationDelay: `${2.0 + (data.stats.length * 0.5)}s` }}>
            {data.message}
          </div>
        </div>
        <button onClick={onClose} className="fade-in-item mt-4 px-10 py-3 bg-[#8b4513] text-white rounded-full hover:bg-[#a0522d] transition-colors shadow-lg" style={{ animationDelay: `${2.5 + (data.stats.length * 0.5)}s` }}>
          확인
        </button>
      </div>
    </div>
  );
};

export default FutureReportModal;