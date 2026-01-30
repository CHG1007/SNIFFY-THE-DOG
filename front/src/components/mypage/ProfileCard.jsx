// const ProfileCard = () => {
//   // 나중에 서버에서 받아온 실제 유저 이미지 URL이 들어갈 자리입니다.
//   return (
//     <div className="flex flex-col items-center gap-3">
//       {/* 프로필 이미지 틀 */}
//       <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-700 shadow-xl">
//         <img 
//           src="https://via.placeholder.com/150" 
//           alt="Profile" 
//           className="w-full h-full object-cover"
//         />
//       </div>
      
//       {/* 배지와 티어 정보 */}
//       <div className="flex flex-col items-center">
//         <div className="w-12 h-12 bg-orange-900/30 rounded-lg flex items-center justify-center mb-1">
//           <span className="text-2xl">🏆</span>
//         </div>
//         <span className="text-[#ff8a00] font-black text-2xl italic tracking-tighter uppercase">Gold</span>
//       </div>
//     </div>
//   );
// };

import ModifyBtn from './ModifyBtn';

const ProfileCard = ({ 
  nickname, 
  setNickname, 
  realName, 
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
          {/* 카카오에서 이름 못 가져올 경우 '(알수없음)' 출력 */}
          <p className="text-white/40 text-lg font-medium">
            {realName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;