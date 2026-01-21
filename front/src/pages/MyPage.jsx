import ProfileCard from '../components/mypage/ProfileCard';
import UserHistorySection from '../components/mypage/UserHistorySection';

const MyPage = () => {
  return (
    <div className="h-[calc(100vh-80px)] bg-[#121212] pl-20 pr-10 py-6 relative flex justify-start items-start gap-12 overflow-hidden">
      
      {/* 1. 왼쪽: 프로필 카드 */}
      <aside className="sticky top-32 transform -translate-y-23 flex-shrink-0">
        <ProfileCard /> 
      </aside>

      {/* 2. 오른쪽: 사용자 정보 및 전적 리스트 */}
      <main className="mt-10 flex-grow max-w-5xl">
        <UserHistorySection />
      </main>

      {/* 3. 회원 탈퇴 버튼 */}
      <div className="fixed bottom-20 right-35">
        <button className="text-orange-100 text-lx cursor-pointer hover:opacity-100">
          회원탈퇴
        </button>
      </div>
    </div>
  );
};

export default MyPage;