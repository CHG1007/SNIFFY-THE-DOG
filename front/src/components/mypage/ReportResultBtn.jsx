const ReportResultBtn = ({ result }) => {
  // 결과에 따라 테두리 색상을 결정합니다.
  const borderColor = result === "승리" ? "border-[#00ffcc]" : "border-[#ff8a00]";

  const handleClick = () => {
    // 나중에 모달창을 띄우는 로직이 들어갈 자리입니다.
    console.log("AI 분석 결과 모달 열기");
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-1 rounded-full border-2 bg-transparent text-white text-sm font-bold cursor-pointer hover:scale-105 transition-transform ${borderColor}`}
    >
      결과보기
    </button>
  );
};

export default ReportResultBtn;