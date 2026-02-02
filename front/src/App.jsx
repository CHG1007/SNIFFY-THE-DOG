// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <BrowserRouter>
      <div className = "min-h-screen overflow-x-hidden">
      <AiTestLauncher/>
            <Routes>    
                <Route path="/" element={<OnboardingPage />} />
                <Route path="/tutorial" element={<TutorialPage />} />
                <Route path="/rooms" element={
                    <WithHeaderLayout backgroundUrl="/assets/images/roompage/background.png">
                        <RoomPage />
                    </WithHeaderLayout>
            } />
                <Route path="/rooms/:roomId" element={<><Header /><WaitingRoomPage /></>} />
                <Route path="/users" element={<><Header /><MyPage /></>} />
                <Route path="/admin" element={<><Header /><AdminPage /></>} />
                <Route path="/video-test" element={<VideoTestPage />} />
                <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;