import ProfileCard from '../components/mypage/ProfileCard';
import UserHistorySection from '../components/mypage/UserHistorySection';

const MyPage = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#121212] pl-20 pr-10 py-6 relative flex justify-start items-start gap-12 overflow-y-auto custom-scrollbar">
      
      {/* 1. 왼쪽: 프로필 카드 */}
      <aside className="sticky top-8 flex-shrink-0">
        <ProfileCard /> 
      </aside>

      {/* 2. 오른쪽: 사용자 정보 및 전적 리스트 */}
      <main className="mt-10 flex-grow max-w-5xl flex flex-col">
        <UserHistorySection />
      </main>

    </div>
  );
};

export default MyPage;