const ProfileCard = () => {
  // 나중에 서버에서 받아온 실제 유저 이미지 URL이 들어갈 자리입니다.
  return (
    <div className="flex flex-col items-center gap-3">
      {/* 프로필 이미지 틀 */}
      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-700 shadow-xl">
        <img 
          src="https://via.placeholder.com/150" 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* 배지와 티어 정보 */}
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-orange-900/30 rounded-lg flex items-center justify-center mb-1">
          <span className="text-2xl">🏆</span>
        </div>
        <span className="text-[#ff8a00] font-black text-2xl italic tracking-tighter uppercase">Gold</span>
      </div>
    </div>
  );
};

export default ProfileCard;