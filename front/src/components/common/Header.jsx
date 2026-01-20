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
    <header>
      {/* 1. 로고: 클릭 시 무조건 /rooms로 이동 */}
      <div className="logo">
        <Link to="/rooms">SNIFFY the DOG</Link>
      </div>

      {/* 2. 유저 메뉴 섹션 */}
      <div className="user-section">
        {/* 프로필 이미지와 닉네임 표시부 */}
        <div className="user-info">
          <span>user123 님</span>
        </div>

        {/* 드롭다운 메뉴 영역 */}
        <ul className="dropdown">
          <li onClick={() => navigate('/users')}>
            마이페이지
          </li>
          <li onClick={handleLogout}>
            로그아웃
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;