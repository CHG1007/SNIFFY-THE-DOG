import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from "../../stores/useAuthStore";
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const {user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // ***** 로그아웃 기능 *****
   const handleLogout = async () => {
    try {
      // 1. 로그아웃 API 호출
      await logoutApi();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // 2. 전역 상태 초기화
      logout();
      
      // 3. 로컬 스토리지 명시적 삭제 (persist 미들웨어 키)
      localStorage.removeItem('auth-storage');
      
      console.log("로그아웃 성공");
      navigate('/');
    }
  };


  // ***** 메뉴 바깥 영역 클릭하면 닫히게 하는 기능 *****
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex relative z-50 justify-between items-center px-10 py-2.5 bg-[#121212] border-b border-gray-800 text-white">
      {/* 1. 로고: 클릭 시 무조건 /rooms로 이동 */}
      <div className="flex items-center">
        <Link to="/rooms" className="text-2xl font-black tracking-tighter">
          <span className="text-[#ff8a00]">SNIFFY</span> <span className="text-white">the DOG</span>
        </Link>
      </div> 

      {/* 유저 메뉴 섹션 */}
      <div className="relative inline-flex flex-col items-end" ref={menuRef}>        {/* 클릭 시 메뉴 토글 */}
        <div 
          className="flex items-center gap-3 cursor-pointer py-2 px-1"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden border-2 border-gray-500">
            {/* 없는 api 호출 임시 수정 <img src="/api/placeholder/32/32" alt="profile" /> */}
            <img
                src={user?.profileImage || "https://ui-avatars.com/api/?name=User&background=random"}
                alt="profile"
                className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl whitespace-nowrap">{user?.nickname || 'user123'} 님</span>
        </div>

        {/* 세 번째 사진 스타일의 드롭다운 */}
        {isMenuOpen && (
          <ul className="absolute top-[118%] left-0 w-[190px] bg-[#121212] border border-gray-800 shadow-2xl z-[60]">          
            <li 
              onClick={() => { navigate('/users'); setIsMenuOpen(false); }}
              className="py-4 text-center text-lg hover:text-primary transition-colors cursor-pointer border-b border-gray-800"
            >
              마이페이지
            </li>
            {user?.isAdmin && (
            <li 
              onClick={() => navigate('/admin')}
              className="px-4 py-3 text-sm hover:bg-[#ff8a00] hover:text-white transition-colors cursor-pointer border-b border-gray-800"
            >
              관리자 페이지
            </li>
            )}
            <li 
              onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              className="py-4 text-center text-lg text-red-500 hover:text-primary transition-colors cursor-pointer"
            >
              로그아웃
            </li>
          </ul>
        )}
      </div>
    </header>
  );
};

export default Header;