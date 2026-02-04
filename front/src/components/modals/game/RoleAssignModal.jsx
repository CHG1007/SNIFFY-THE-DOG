const RoleAssignModal = ({ isOpen, role, roleInfo, onClose }) => {
  if (!isOpen || !role || !roleInfo) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white mb-8">당신의 역할은</h1>
        <div className={`text-7xl font-black ${roleInfo.color} mb-6`}>
          {roleInfo.name}
        </div>
        <p className="text-xl text-gray-300 mb-12">{roleInfo.description}</p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-[#ff8a00] text-white font-bold rounded-full hover:bg-orange-500 transition-all"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default RoleAssignModal;
