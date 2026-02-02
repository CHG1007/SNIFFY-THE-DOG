// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import OnboardingPage from './pages/OnboardingPage';
import TutorialPage from './pages/TutorialPage';
import RoomPage from './pages/RoomPage';
import VideoTestPage from './pages/VideoTestPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import Header from './components/common/Header';
import WaitingRoomPage from './pages/WaitingRoomPage';
import AiTestLauncher from './components/aitest/AiTestLauncher';
import WithHeaderLayout from './components/common/WithHeaderLayout';

// 1. 별도의 컴포넌트로 분리 (App 함수 밖이나 위에 두는 게 깔끔합니다)
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

// 2. 경로 변경을 감지하기 위한 내부 컴포넌트
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    // mode="wait"를 주어야 이전 페이지가 완전히 사라진 후 다음 페이지가 나타납니다.
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><OnboardingPage /></PageWrapper>} />
        <Route path="/tutorial" element={<PageWrapper><TutorialPage /></PageWrapper>} />
        <Route path="/rooms" element={
          <PageWrapper>
            <WithHeaderLayout backgroundUrl="/assets/images/roompage/background.png">
              <RoomPage />
            </WithHeaderLayout>
          </PageWrapper>
        } />
        <Route path="/rooms/:roomId" element={<PageWrapper><Header /><WaitingRoomPage /></PageWrapper>} />
        <Route path="/users" element={<PageWrapper><Header /><MyPage /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Header /><AdminPage /></PageWrapper>} />
        <Route path="/video-test" element={<PageWrapper><VideoTestPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* 배경을 검은색으로 고정하면 페이드 효과가 더 고급스러워집니다 */}
      <div className="min-h-screen overflow-x-hidden bg-black">
        <AiTestLauncher />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;