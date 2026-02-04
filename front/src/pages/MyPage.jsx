import { useEffect, useState } from 'react';
import ProfileCard from '../components/mypage/ProfileCard';
import UserHistorySection from '../components/mypage/UserHistorySection';
import { getMyProfile, getUserBadges, getUserGameHistory, updateNickname } from '../api/userApi';
import useAuthStore from '../stores/useAuthStore';
import LastBeggingModal from '../components/modals/LastBeggingModal';
import AiAnalyzeModal from '../components/modals/AiAnalyzeModal';


const MyPage = () => {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [games, setGames] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState(user?.nickname || "");

  //알림 모달
  const [errorMsg, setErrorMsg] = useState(null);
  const [subMsg, setSubMsg] = useState(null);

  // ai 결과 보고서 모달
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, badgesRes, gamesRes] = await Promise.all([
          getMyProfile(),
          getUserBadges(),
          getUserGameHistory(0, 20) // Load first 20 games
        ]);

        if (profileRes.success) {
          setProfile(profileRes.data);
          setEditNickname(profileRes.data.nickname);
        }
        
        if (badgesRes.success) {
           // Handle badge response structure: { badges: [...] }
          setBadges(badgesRes.data.badges || []);
        }

        if (gamesRes.success) {
          const mappedGames = (gamesRes.data.content || []).map(item => ({
            gameId: item.gameId,
            date: item.startAt ? new Date(item.startAt).toISOString().split('T')[0].replace(/-/g, '.') : '',
            role: item.job, // Mapping job -> role
            result: item.result,
            team: item.winner,
            playTime: item.playTime,

            onReport: () => handleOpenAnalysis(item.gameId)
          }));
          setGames(mappedGames);
        }

      } catch (error) {
        console.error("Failed to fetch my page data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSaveNickname = async () => {
    const trimmedNickname = editNickname.trim();

    const validPattern = /^[가-힣a-zA-Z0-9]+$/;
    
    if (trimmedNickname.length < 1 || trimmedNickname.length > 20) {
      setErrorMsg("닉네임 길이를\n확인해주세요.");
      setSubMsg("- 1자 이상 20자 이하로 입력\n- 공백은 포함될 수 없습니다.");
      return;
    }
    
    if (!validPattern.test(trimmedNickname)) {
      setErrorMsg("사용할 수 없는 문자가\n포함되었습니다.");
      setSubMsg("- 한글, 영문, 숫자만 사용 가능\n- 특수문자 및 초성/모음 불가");
      return;
    }
    
    try {
      const res = await updateNickname(editNickname);
      // 백엔드 응답 포맷이 { success: true, ... } 라고 가정
      if (res.success) {
          const newNickname = res.data.nickname;
          
          // 1. 로컬 상태 업데이트
          setProfile(prev => ({ ...prev, nickname: newNickname }));
          setEditNickname(newNickname); // 입력창 상태도 최신화
          
          // 2. 전역 상태 및 스토리지 업데이트 (헤더 즉시 반영용)
          if (user) {
            const updatedUser = { ...user, nickname: newNickname };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser)); // 새로고침 대비
          }
          
          setErrorMsg("닉네임이 성공적으로\n변경되었습니다.");
          setSubMsg(null); // 성공 시 서브 메시지 비움
          setIsEditing(false);
      } else {
        // success가 false인 경우 (백엔드 에러 메시지 등)
        console.error("Nickname update failed:", res);
        setErrorMsg("닉네임 변경에\n실패했습니다.");
        setSubMsg("이미 사용 중인\n닉네임일 수 있습니다.");
      }
    } catch (error) {
      console.error("Failed to update nickname:", error);
      setErrorMsg("닉네임 변경 중\n오류가 발생했습니다.");
      setSubMsg(null);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original nickname
    setEditNickname(profile?.nickname || "");
    setIsEditing(false);
  };

  const handleReport = (game) => {
    console.log("Report game:", game);
  };

  // 분석 버튼 클릭 시 실행할 핸들러 추가
  const handleOpenAnalysis = async (gameId) => {
    try {
      // TODO: 실제 API 연결 (예: const res = await getGameAnalysis(gameId);)
      // 현재는 테스트용 더미 데이터 세팅
      const dummyData = {
        totalSummary: "전체 게임 요약 3줄이 들어가는 공간입니다.\n두 번째 줄입니다.\n세 번째 줄입니다.",
        playerReports: {
          [profile?.nickname]: "나의 개인 활약상 2줄이 들어가는 공간입니다.\n두 번째 줄입니다."
        }
      };
      setSelectedAnalysis(dummyData);
      setIsAiModalOpen(true);
    } catch (error) {
      console.error("분석 데이터를 가져오지 못했습니다.", error);
    }
  };

  // Profile Image Logic: (userId % 4) + 1
  const profileImgIndex = profile ? (profile.userId % 4) + 1 : 1;
  const profileImagePath = `/assets/images/mypage/profile/profile${profileImgIndex}.png`;

  return (
    <div
      className="h-screen w-full bg-cover bg-center bg-fixed relative flex flex-col items-center pt-12 px-6 overflow-hidden"
      style={{ backgroundImage: "url('/assets/images/mypage/MyPageBackground.png')" }}
    >
      <div className="relative z-10 w-full max-w-[1100px] h-full flex flex-col overflow-hidden pb-6">
        <section className="w-full shrink-0 mb-4">
          <ProfileCard
            nickname={editNickname}
            setNickname={setEditNickname}
            isEditing={isEditing}
            onEditClick={() => setIsEditing(true)}
            onSave={handleSaveNickname}
            onCancel={handleCancelEdit}
            badges={badges}
            profileImage={profileImagePath}
          />
        </section>

        <section className="w-full flex-1 min-h-0 overflow-hidden">
          <UserHistorySection games={games} onReport={handleReport}/>
        </section>
      </div>
      <AiAnalyzeModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        data={selectedAnalysis}
        nickname={profile?.nickname}
      />
      {/* 정보 알림용 모달 (Okay 버튼) */}
      <LastBeggingModal
        isOpen={!!errorMsg}
        message={errorMsg}
        subMessage={subMsg} 
        onClose={() => {
          setErrorMsg(null);
          setSubMsg(null);
        }}
      />

    </div>
  );
};

export default MyPage;