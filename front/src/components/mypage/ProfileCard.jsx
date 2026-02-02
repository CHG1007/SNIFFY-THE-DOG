import ModifyBtn from './ModifyBtn';

const ProfileCard = ({ 
  nickname, 
  setNickname, 
  isEditing, 
  onEditClick 
}) => {
  return (
    <div className="flex items-center gap-8 w-full">
      {/* 왼쪽: 프로필 사진 섹션 */}
      <div className="flex-shrink-0">
        <div className="w-32 h-32 rounded-full overflow-hidden border-[5px] border-white/20 shadow-xl">
          <img src="/assets/images/mypage/user-profile.png" className="w-full h-full object-cover" alt="Profile" />
        </div>
      </div>

      {/* 오른쪽: 정보 영역 */}
      <div className="flex flex-col items-start gap-2">
        {/* 등급 영역 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-950/40 rounded-lg flex items-center justify-center border border-white/10">
            <span className="text-lg">🏆</span>
          </div>
          <span className="text-white font-black text-xl italic uppercase tracking-widest">GOLD</span>
        </div>

        {/* 닉네임 + 본명 영역 (수정 모드 전환 포함) */}
        <div className="flex flex-col items-start pl-1">
          <div className="flex items-center gap-3 h-[45px]">
            {isEditing ? (
              <input 
                autoFocus
                className="bg-[#1a1a1a] text-white text-3xl font-black border-b-2 border-[#ff8a00] outline-none px-2 w-[250px]"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            ) : (
              <h1 className="text-white text-4xl font-black tracking-tighter drop-shadow-lg">{nickname}</h1>
            )}
            <ModifyBtn isEditing={isEditing} onClick={onEditClick} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;