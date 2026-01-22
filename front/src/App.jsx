// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OnboardingPage from './pages/OnboardingPage';
import TutorialPage from './pages/TutorialPage';
import RoomPage from './pages/RoomPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import Header from './components/common/Header';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 헤더가 없는 온보딩/튜토리얼 페이지 */}
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />

        {/* 헤더가 공통으로 들어가는 메인 서비스 페이지들 */}
        <Route path="/rooms" element={<><Header /><RoomPage /></>} />
        <Route path="/rooms/:roomId" element={<><Header /><RoomPage /></>} />
        
        <Route path="/users" element={<><Header /><MyPage /></>} />

        {/* 관리자 페이지 */}
        <Route path="/admin" element={<><Header /><AdminPage /></>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;