const ConfirmBtn = ({ text, onClick, variant = "primary", className = "" }) => {
  const variants = {
    primary: "bg-[#EA6600] hover:bg-[#ffaa44] text-white",
    secondary: "bg-[#333333] hover:bg-[#444444] text-white", 
    danger: "bg-red-600 hover:bg-red-500 text-white",
  };

  return (
    <button
      onClick={onClick}
      // 기존 스타일 뒤에 ${className}을 붙여서 외부에서 준 사이즈를 적용합니다.
      className={`px-6 py-3 rounded-xl font-black transition-all cursor-pointer shadow-lg active:scale-95 ${variants[variant]} ${className}`}
    >
      {text}
    </button>
  );
};

export default ConfirmBtn;