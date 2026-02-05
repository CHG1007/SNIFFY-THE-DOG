const TextInput = ({ value, onChange, placeholder, errorMsg }) => {
  return (
    <div className="w-full flex flex-col items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#1a1a1a] border-1 border-primary rounded-xl px-4 py-4 text-white text-center text-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600 font-bold"
      />
      {/* 에러 메시지가 있을 때만 노출 (닉네임이 별로입니다 등) */}
      <div className="h-4 w-full flex items-center px-2">
        {/* errorMsg가 있으면 글자가 보이고, 없으면 빈 칸으로 유지됩니다 */}
        <span className="text-red-500 text-sm font-bold text-left">
          {errorMsg}
        </span>
      </div>
    </div>
  );
};

export default TextInput;