const ModifyBtn = ({ isEditing, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-black text-white px-3 py-1 rounded-md text-sm font-bold cursor-pointer hover:bg-gray-800 transition-colors"
    >
      {isEditing ? "저장" : "수정"}
    </button>
  );
};

export default ModifyBtn;