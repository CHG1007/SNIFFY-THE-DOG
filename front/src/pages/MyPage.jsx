import { useEffect, useState } from 'react';
import ProfileCard from '../components/mypage/ProfileCard';
import UserHistorySection from '../components/mypage/UserHistorySection';

const MyPage = () => {
  const API_BASE_URL = 'http://localhost:8080/api/v1';

  const [nickname, setNickname] = useState("");
  const [games, setGames] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // 1. 페이지가 로드될 때, DB 값 가져오기
  useEffect(() => {
    fetchUserData();
  }, []);

  // 1. MySQL에서 내 정보 가져오기
  const fetchUserData = async () => {
    try {
      const response = await axios.get('${API_BASE_URL}/users/me');
      const { nickname, realName, games } = response.data;
      
      setNickname(nickname);
      setRealName(realName);
      setGames(games || []);
    } catch (error) {
      console.error("DB 데이터를 불러오는데 실패했습니다:", error);
    }
  };

  const handleEditClick = async () => {
    if (isEditing) {
      try {
        await axios.patch('${API_BASE_URL}/users/me/nickname', {nickname: nickname});
        console.log("DB 저장 완료: ", nickname);
      } catch (error) {
        console.log("닉네임 저장 실패: ", error);
        return;
      }
    }
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