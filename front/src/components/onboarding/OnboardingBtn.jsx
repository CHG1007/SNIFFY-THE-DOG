
const OnboardingBtn = ({ children, onClick, type = 'primary' }) => {
  // 온보딩 전용 사이즈와 폰트 설정
  const baseStyles = "w-90 py-5 text-2xl font-black rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-2xl";
  
  const variants = {
    // 메인 로그인 버튼 (주황색 강조)
    primary: "bg-primary text-white",
    // 튜토리얼 버튼 (테두리 강조)
    outline: "bg-white border border-primary text-primary hover:bg-white",
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