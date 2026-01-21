const XBtn = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="text-gray-400 hover:text-white transition-colors cursor-pointer text-2xl"
    >
      ✕
    </button>
  );
};

export default XBtn;