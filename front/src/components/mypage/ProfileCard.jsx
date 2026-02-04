import { Pencil } from 'lucide-react';

const ProfileCard = ({
  nickname,
  setNickname, 
  isEditing,
  onEditClick,
  onSave,
  onCancel,
  badges = [],
  profileImage
}) => {
  return (
    <div className="flex items-center gap-8 w-full">
      {/* Profile Image Area */}
      <div className="flex-shrink-0">
        <div className="w-32 h-32 rounded-full overflow-hidden border-[5px] border-white/20 shadow-xl bg-black/40">
          <img 
            src={profileImage || "/assets/images/mypage/user-profile.png"} 
            className="w-full h-full object-cover" 
            alt="Profile" 
          />
        </div>
      </div>


      {/* Profile Info */}
      <div className="flex flex-col items-start gap-2">
        {/* Badges Display Area */}
        <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
          {badges && badges.length > 0 ? (
             badges.map((badge, index) => (
                <div 
                  key={index} 
                  className="px-3 py-1 bg-orange-950/40 rounded-lg border border-white/10 text-white text-sm flex items-center justify-center shadow-md" 
                  title={badge.description}
                >
                  <span className="font-semibold tracking-wide">{badge.name}</span>
                </div>
             ))
          ) : (
             <div className="px-3 py-1 bg-gray-800/40 rounded-lg border border-white/10 text-gray-400 text-sm">
               뱃지 없음
             </div>
          )}
        </div>

        {/* Nickname & Edit Button */}
        <div className="flex flex-col items-start pl-1">
          <div className="flex items-center gap-4 h-[50px]">
            {isEditing ? (
              <>
                <input
                  autoFocus
                  className="bg-[#1a1a1a] text-white text-3xl font-black border-b-2 border-[#ff8a00] outline-none px-2 w-[250px]"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSave();
                    if (e.key === 'Escape') onCancel();
                  }}
                />
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors text-sm"
                  >
                    취소
                  </button>
                  <button 
                    onClick={onSave}
                    className="px-4 py-2 bg-[#ff8a00] hover:bg-[#e67e00] text-black font-bold rounded-lg transition-colors text-sm shadow-lg"
                  >
                    저장
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-white text-4xl font-black tracking-tighter drop-shadow-lg">{nickname}</h1>
                <button 
                  onClick={onEditClick}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-all ml-2 group"
                >
                  <Pencil size={14} className="group-hover:text-[#ff8a00] transition-colors" />
                  <span className="text-sm font-bold">닉네임 수정</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
