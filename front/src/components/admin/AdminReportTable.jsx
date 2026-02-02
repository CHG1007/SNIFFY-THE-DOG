import React from 'react';

const AdminReportTable = ({ reports, pageInfo, onPageChange }) => {
  // 상태 뱃지 스타일링 함수
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/50">
            PENDING
          </span>
        );
      case 'PROCESSED':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/20 text-green-500 border border-green-500/50">
            PROCESSED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/50">
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

  // 페이지네이션 렌더링
  const renderPagination = () => {
    if (!pageInfo) return null;

    const { totalPages, currPage } = pageInfo;
    const pages = [];

    for (let i = 0; i < totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
            currPage === i
              ? 'bg-[#ff8a00] text-black'
              : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] hover:text-white'
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2 mt-6 justify-center">
        <button
          onClick={() => onPageChange(Math.max(0, currPage - 1))}
          disabled={currPage === 0}
          className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          이전
        </button>
        <div className="flex gap-2 mx-2 flex-wrap justify-center">{pages}</div>
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currPage + 1))}
          disabled={currPage === totalPages - 1}
          className="px-3 py-1.5 rounded-lg bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          다음
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* 테이블 컨테이너 */}
      <div className="w-full overflow-hidden rounded-xl border border-gray-800 bg-[#1e1e1e] shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2a2a2a] text-gray-400 text-sm uppercase tracking-wider border-b border-gray-700">
              <th className="px-6 py-4 font-bold w-[10%]">No</th>
              <th className="px-6 py-4 font-bold w-[15%]">신고자</th>
              <th className="px-6 py-4 font-bold w-[15%]">대상 유저</th>
              <th className="px-6 py-4 font-bold w-[30%]">신고 사유</th>
              <th className="px-6 py-4 font-bold w-[15%]">상태</th>
              <th className="px-6 py-4 font-bold w-[15%] text-right">신고 일자</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {reports && reports.length > 0 ? (
              reports.map((report) => (
                <tr
                  key={report.reportId}
                  className="hover:bg-[#252525] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-gray-300 font-medium">
                    {report.reportId}
                  </td>
                  <td className="px-6 py-4 text-white font-bold">
                    {report.reporter?.nickname || '알 수 없음'}
                  </td>
                  <td className="px-6 py-4 text-[#ff8a00] font-bold">
                    {report.reportedUser?.nickname || '알 수 없음'}
                  </td>
                  <td className="px-6 py-4 text-gray-400 truncate max-w-[200px]">
                    {report.reason}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                  <td className="px-6 py-4 text-gray-500 text-right text-sm">
                    {formatDate(report.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  신고 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {renderPagination()}
    </div>
  );
};

export default AdminReportTable;
