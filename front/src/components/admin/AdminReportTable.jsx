import React, { useState } from 'react';
import Pagination from '../common/Pagination';

const AdminReportTable = ({ reports }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 클라이언트 사이드 페이지네이션 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = reports ? reports.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = reports ? Math.ceil(reports.length / itemsPerPage) : 0;

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
            {currentReports && currentReports.length > 0 ? (
              currentReports.map((report) => (
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
                  <td className="px-6 py-4 text-primary font-bold">
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

      {/* 클라이언트 사이드 페이지네이션 컴포넌트 */}
      {reports && reports.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AdminReportTable;