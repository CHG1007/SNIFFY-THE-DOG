// import ProfileCard from '../components/mypage/ProfileCard';
// import UserHistorySection from '../components/mypage/UserHistorySection';

// const MyPage = () => {
//   return (
//     /* 1. 전체 배경 설정: public/assets/images/mypage/ 폴더의 배경화면 적용 */
//     /* bg-fixed를 사용하면 스크롤 시 배경은 고정되고 컨텐츠만 움직여서 더 고급스러워요. */
//     <div 
//       className="min-h-screen w-full bg-cover bg-center bg-fixed relative overflow-x-hidden flex items-center justify-center py-20"
//       style={{ backgroundImage: "url('/assets/images/mypage/MyPageBackground.png')" }}
//     >
//       {/* 2. 어두운 오버레이: 배경을 살짝 어둡게 해서 글자 가독성을 높입니다. (40% 투명도) */}
//       <div className="absolute inset-0 bg-black/40"></div>
      
//       {/* 3. 컨텐츠 레이어: z-10으로 오버레이 위로 올리고, 디자인 시안처럼 가로 배치 */}
//       <div className="relative z-10 w-full max-w-[1200px] px-10">
//         <div className="flex flex-col md:flex-row items-start justify-center gap-12 lg:gap-20">
          
//           {/* 왼쪽 영역: 프로필 이미지 및 티어 (ProfileCard) */}
//           {/* 이미지만큼의 너비를 유지하도록 flex-shrink-0 적용 */}
//           <aside className="flex-shrink-0 mx-auto md:mx-0">
//             <ProfileCard />
//           </aside>

//           {/* 오른쪽 영역: 닉네임, 전적 타이틀, 전적 테이블 (UserHistorySection) */}
//           {/* 남은 공간을 꽉 채우도록 flex-grow 적용 */}
//           <main className="flex-grow w-full">
//             <UserHistorySection />
//           </main>
          
//         </div>
//       </div>
//     </div>
//   );
// };

import { useState } from 'react';
import ProfileCard from '../components/mypage/ProfileCard';
import UserHistorySection from '../components/mypage/UserHistorySection';

const MyPage = () => {
  const [nickname, setNickname] = useState("킁킁강아지123");
  const [isEditing, setIsEditing] = useState(false);
  const realName = "김덕근"; 

  // 1. 테이블에 표시할 데이터를 여기에 만듭니다.
  const [games] = useState([
    { date: "2026.01.15", role: "MAFIA", result: "LOSE", team: "최고" },
    { date: "2026.01.15", role: "MAFIA", result: "WIN", team: "최악" },
    { date: "2026.01.15", role: "POLICE", result: "WIN", team: "보통" },
  ]);

  const handleEditClick = () => {
    if (isEditing) console.log("저장됨:", nickname);
    setIsEditing(!isEditing);
  };

  const handleReport = (game) => {
    console.log("리포트 확인:", game);
  };

  return (
    <div 
      className="h-screen w-full bg-cover bg-center bg-fixed relative flex flex-col items-center pt-12 px-6 overflow-hidden"
      style={{ backgroundImage: "url('/assets/images/mypage/MyPageBackground.png')" }}
    >
      {/* <div className="absolute inset-0 bg-black/20 fixed"></div> */}
      
      <div className="relative z-10 w-full max-w-[1100px] h-full flex flex-col overflow-hidden pb-6">
        <section className="w-full shrink-0 mb-4">
          <ProfileCard 
            nickname={nickname}
            setNickname={setNickname}
            realName={realName}
            isEditing={isEditing}
            onEditClick={handleEditClick}
          />
        </section>

        {/* 2. UserHistorySection에 데이터를 넘겨줍니다. */}
        <section className="w-full flex-1 min-h-0 overflow-hidden">
          <UserHistorySection games={games} onReport={handleReport} />
        </section>
      </div>
    </div>
  );
};

export default MyPage;