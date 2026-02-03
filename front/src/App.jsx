import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";

// Pages
import OnboardingPage from './pages/OnboardingPage';
import TutorialPage from './pages/TutorialPage';
import RoomPage from './pages/RoomPage';
import VideoTestPage from './pages/VideoTestPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import ResultPage from './pages/ResultPage';

// Components
import Header from './components/common/Header';
import WithHeaderLayout from './components/common/WithHeaderLayout';
import AiTestLauncher from './components/aitest/AiTestLauncher';

// 1. 애니메이션 래퍼 (본인의 UI 기능)
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// 2. 경로 및 애니메이션 처리 컴포넌트
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 1. 헤더가 없는 페이지 */}
        <Route path="/" element={<PageWrapper><OnboardingPage /></PageWrapper>} />
        <Route path="/tutorial" element={<PageWrapper><TutorialPage /></PageWrapper>} />

        {/* 2. 대기실 리스트 (배경이 있는 헤더 레이아웃) */}
        <Route path="/rooms" element={
          <PageWrapper>
            <WithHeaderLayout backgroundUrl="/assets/images/roompage/background.png">
              <RoomPage />
            </WithHeaderLayout>
          </PageWrapper>
        } />

        {/* 3. 게임 대기방 (팀원이 추가한 두 가지 경로 모두 애니메이션 적용) */}
        <Route path="/waiting-room/:roomId" element={<PageWrapper><Header /><WaitingRoomPage /></PageWrapper>} />
        <Route path="/rooms/:roomId" element={<PageWrapper><Header /><WaitingRoomPage /></PageWrapper>} />

        {/* 4. 마이페이지 및 관리자 */}
        <Route path="/users" element={<PageWrapper><Header /><MyPage /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Header /><AdminPage /></PageWrapper>} />

        {/* 5. 테스트 페이지 */}
        <Route path="/video-test" element={<PageWrapper><VideoTestPage /></PageWrapper>} />
        <Route path="/result" element= {<PageWrapper><ResultPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* 본인의 디자인 의도: 배경을 검은색으로 고정하여 애니메이션 효과 극대화 */}
      <div className="min-h-screen overflow-x-hidden bg-black">
        <AiTestLauncher />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;