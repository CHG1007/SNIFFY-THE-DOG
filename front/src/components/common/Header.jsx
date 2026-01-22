import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  // 로그아웃 처리 함수
  const handleLogout = () => {
    // 1. 여기서 로그아웃 API 호출 (POST /api/v1/auth/logout)
    // 2. 성공 시 온보딩 페이지('/')로 이동
    console.log("로그아웃 로직 실행");
    navigate('/');
  };

  return (
    <header className="flex relative z-50 justify-between items-center px-10 py-3.5 bg-[#121212] border-b border-gray-800 text-white">
      {/* 1. 로고: 클릭 시 무조건 /rooms로 이동 */}
      <div className="flex items-center">
        <Link to="/rooms" className="text-2xl font-black tracking-tighter">
          <span className="text-[#ff8a00]">SNIFFY</span> <span className="text-white">the DOG</span>
        </Link>
      </div>

      {/* 2. 유저 메뉴 섹션 */}
      <div className="relative group">
        {/* 유저 정보 (항상 보이는 부분) */}
        <div className="flex items-center gap-3 cursor-pointer py-2">
          {/* 임시 프로필 이미지 아이콘 */}
          <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden border border-gray-500">
            <img src="/api/placeholder/32/32" alt="profile" />
          </div>
          <span className="font-bold">user123 님</span>
        </div>

        {/* 드롭다운 메뉴 영역 */}
        <ul className="absolute right-0 top-full w-40 bg-[#1a1a1a] border border-gray-700 rounded-md shadow-2xl 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
          <li 
            onClick={() => navigate('/users')}
            className="px-4 py-3 text-sm hover:bg-[#ff8a00] hover:text-white transition-colors cursor-pointer border-b border-gray-800"
          >
            마이페이지
          </li>
          <li 
            onClick={handleLogout}
            className="px-4 py-3 text-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
          >
            로그아웃
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;