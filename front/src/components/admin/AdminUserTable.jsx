import React from 'react';

const AdminUserTable = ({ users }) => {
  // 상태 뱃지 스타일링 함수
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-500 border border-green-500/50">
            ACTIVE
          </span>
        );
      case 'BANNED':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-500 border border-red-500/50">
            BANNED
          </span>
        );
      case 'INACTIVE':
      case 'DELETED':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/50">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/50">
            {status}
          </span>
        );
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="w-full">
      {/* 테이블 컨테이너 */}
      <div className="w-full overflow-hidden rounded-xl border border-gray-800 bg-[#1e1e1e] shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2a2a2a] text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
              <th className="px-6 py-4 font-bold w-[10%]">ID</th>
              <th className="px-6 py-4 font-bold w-[20%]">닉네임</th>
              <th className="px-6 py-4 font-bold w-[15%]">소셜 제공자</th>
              <th className="px-6 py-4 font-bold w-[15%]">권한</th>
              <th className="px-6 py-4 font-bold w-[15%]">상태</th>
              <th className="px-6 py-4 font-bold w-[15%] text-right">가입 일자</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.userId}
                  className="hover:bg-[#252525] transition-colors"
                >
                  <td className="px-6 py-4 text-gray-300 font-medium">
                    {user.userId}
                  </td>
                  <td className="px-6 py-4 text-white font-bold">
                    {user.nickname}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {user.socialProvider}
                  </td>
                  <td className="px-6 py-4 text-[#ff8a00] font-medium">
                    {user.role}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 text-gray-500 text-right text-sm">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  등록된 유저가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserTable;
