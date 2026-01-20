
const OnboardingBtn = ({ children, onClick, type = 'primary' }) => {
  // 온보딩 전용 사이즈와 폰트 설정
  const baseStyles = "w-72 py-5 text-2xl font-black rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-2xl";
  
  const variants = {
    // 메인 로그인 버튼 (주황색 강조)
    primary: "bg-[#ff8a00] text-white",
    // 튜토리얼 버튼 (테두리 강조)
    outline: "bg-transparent border-4 border-[#ff8a00] text-[#ff8a00]"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[type]}`}
    >
      {children}
    </button>
  );
};

export default OnboardingBtn;