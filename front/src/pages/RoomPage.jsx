// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import OnboardingPage from './pages/OnboardingPage';
import TutorialPage from './pages/TutorialPage';
import RoomPage from './pages/RoomPage';
import VideoTestPage from './pages/VideoTestPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import WaitingRoomPage from './pages/WaitingRoomPage';

// Components
import Header from './components/common/Header';
import WithHeaderLayout from './components/common/WithHeaderLayout';
import AiTestLauncher from './components/aitest/AiTestLauncher';

function App() {
    return (
        <BrowserRouter>
            {/* 전체 레이아웃 스타일 적용 (가로 스크롤 방지 및 최소 높이) */}
            <div className="min-h-screen overflow-x-hidden">

                {/*===== AI 테스트 =====*/}
                <AiTestLauncher />
                {/*====================*/}

                <Routes>
                    {/* 1. 헤더가 없는 페이지 */}
                    <Route path="/" element={<OnboardingPage />} />
                    <Route path="/tutorial" element={<TutorialPage />} />

                    {/* 2. 대기실 리스트 (배경이 있는 헤더 레이아웃) */}
                    <Route path="/rooms" element={
                        <WithHeaderLayout backgroundUrl="/assets/images/roompage/background.png">
                            <RoomPage />
                        </WithHeaderLayout>
                    } />

                    {/* 3. 게임 대기방 (두 가지 경로 모두 지원) */}
                    {/* CreateGameModal에서 이동하는 경로 */}
                    <Route path="/waiting-room/:roomId" element={<><Header /><WaitingRoomPage /></>} />
                    {/* 일반적인 RESTful 경로 */}
                    <Route path="/rooms/:roomId" element={<><Header /><WaitingRoomPage /></>} />

                    {/* 4. 마이페이지 및 관리자 */}
                    <Route path="/users" element={<><Header /><MyPage /></>} />
                    <Route path="/admin" element={<><Header /><AdminPage /></>} />

                    {/* 5. 테스트 페이지 */}
                    <Route path="/video-test" element={<VideoTestPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;